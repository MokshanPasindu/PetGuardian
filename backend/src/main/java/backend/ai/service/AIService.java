package backend.ai.service;

import backend.ai.dto.AIAnalysisResponse;
import backend.ai.dto.ScanResultDTO;
import backend.ai.model.ScanResult;
import backend.ai.model.Severity;
import backend.ai.repository.ScanResultRepository;
import backend.common.exception.BadRequestException;
import backend.common.exception.ResourceNotFoundException;
import backend.medical.dto.CreateMedicalRecordRequest;
import backend.medical.model.RecordType;
import backend.medical.service.MedicalService;
import backend.notification.service.NotificationService;
import backend.pet.model.Pet;
import backend.pet.repository.PetRepository;
import backend.storage.StorageService;
import backend.user.model.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final ScanResultRepository scanResultRepository;
    private final PetRepository        petRepository;
    private final StorageService       storageService;
    private final MedicalService       medicalService;
    private final ObjectMapper         objectMapper;
    private final RestTemplate         restTemplate;
    private final NotificationService notificationService;
    @Value("${app.ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    // ─────────────────────────────────────────────────────────
    // ANALYZE IMAGE  (main method)
    // ─────────────────────────────────────────────────────────

    @Transactional
    public ScanResultDTO analyzeSkinImage(
            MultipartFile image,
            Long          petId,
            User          owner
    ) {
        // ── Validate pet ownership ────────────────────────────
        Pet pet = petRepository.findByIdAndOwnerId(petId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        // ── Store image ───────────────────────────────────────
        String imageUrl = storageService.store(image, "scans");

        // ── Call Flask /api/predict ───────────────────────────
        AIAnalysisResponse aiResponse = callFlaskPredict(image);

        // ── Fallback to mock if Flask is down ─────────────────
        if (aiResponse == null) {
            log.warn("Flask unavailable — using mock AI response");
            aiResponse = buildMockResponse();
        }

        // ── Persist scan result ───────────────────────────────
        ScanResult scanResult = ScanResult.builder()
                .imageUrl(imageUrl)
                .prediction(aiResponse.getPredictedClass())
                .confidence(aiResponse.getConfidence())
                .severity(aiResponse.getSeverity())
                .guidance(aiResponse.getGuidance())
                .disclaimer(aiResponse.getDisclaimer())
                .vetConnectTriggered(
                        Boolean.TRUE.equals(aiResponse.getVetConnectTrigger())
                )
                .recommendations(
                        joinList(aiResponse.getHomeCareSteps())
                )
                .possibleConditions(
                        serializeConditions(aiResponse.getAllPredictions())
                )
                .pet(pet)
                .savedToMedicalHistory(false)
                .build();

        ScanResult saved = scanResultRepository.save(scanResult);

        // ── UPDATED: Send notification with pet name ────────────────
        try {
            notificationService.sendAIScanNotification(
                    owner,
                    saved.getId(),
                    saved.getPrediction(),
                    saved.getSeverity().name(),
                    saved.getVetConnectTriggered() != null && saved.getVetConnectTriggered(),
                    pet.getName()    // ← Added pet name parameter
            );
        } catch (Exception e) {
            log.warn("Notification failed for scan {}: {}", saved.getId(), e.getMessage());
        }

        log.info(
                "Scan saved | id={} pet={} class='{}' severity={} confidence={}",
                saved.getId(), petId,
                saved.getPrediction(),
                saved.getSeverity(),
                saved.getConfidence()
        );

        return mapToDTO(saved);
    }

    // ─────────────────────────────────────────────────────────
    // FLASK CALL
    // ─────────────────────────────────────────────────────────

    private AIAnalysisResponse callFlaskPredict(MultipartFile image) {
        String endpoint = aiServiceUrl + "/api/predict";

        try {
            // Build multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            String filename = image.getOriginalFilename() != null
                    ? image.getOriginalFilename() : "image.jpg";

            ByteArrayResource imageResource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() { return filename; }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", imageResource);

            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(body, headers);

            // POST to Flask
            ResponseEntity<String> response = restTemplate.postForEntity(
                    endpoint, request, String.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                log.error("Flask returned status: {}", response.getStatusCode());
                return null;
            }

            // Parse Flask JSON response
            JsonNode root = objectMapper.readTree(response.getBody());

            if (!root.path("success").asBoolean(false)) {
                log.error("Flask error: {}", root.path("message").asText());
                return null;
            }

            JsonNode data = root.path("data");
            return parseFlaskData(data);

        } catch (ResourceAccessException e) {
            log.error("Flask unreachable at {}: {}", endpoint, e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Flask call failed: {}", e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────
    // PARSE FLASK RESPONSE
    // ─────────────────────────────────────────────────────────

    private AIAnalysisResponse parseFlaskData(JsonNode data) {
        AIAnalysisResponse resp = new AIAnalysisResponse();

        // Core fields
        String predictedClass = data.path("predictedClass").asText("Unknown");
        resp.setPredictedClass(predictedClass);
        resp.setPrediction(predictedClass);           // alias
        resp.setConfidence(data.path("confidence").asDouble(0.0));
        resp.setSeverity(
                parseSeverity(data.path("severity").asText("MILD"))
        );
        resp.setGuidance(data.path("guidance").asText(""));
        resp.setDisclaimer(data.path("disclaimer").asText(""));
        resp.setVetConnectTrigger(data.path("vetConnectTrigger").asBoolean(false));

        // homeCareSteps → recommendations
        List<String> steps = new java.util.ArrayList<>();
        data.path("homeCareSteps").forEach(n -> steps.add(n.asText()));
        resp.setHomeCareSteps(steps);
        resp.setRecommendations(steps);

        // allPredictions → possibleConditions
        List<AIAnalysisResponse.PossibleCondition> preds = new java.util.ArrayList<>();
        data.path("allPredictions").forEach(n -> {
            AIAnalysisResponse.PossibleCondition pc =
                    new AIAnalysisResponse.PossibleCondition();
            pc.setName(n.path("class").asText());
            pc.setProbability(n.path("confidence").asDouble());
            preds.add(pc);
        });
        resp.setAllPredictions(preds);
        resp.setPossibleConditions(preds);

        return resp;
    }

    // ─────────────────────────────────────────────────────────
    // SCAN HISTORY
    // ─────────────────────────────────────────────────────────

    public List<ScanResultDTO> getScanHistory(Long petId, User owner) {
        petRepository.findByIdAndOwnerId(petId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        return scanResultRepository
                .findByPetIdOrderByCreatedAtDesc(petId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ScanResultDTO> getAllUserScans(User owner) {
        return scanResultRepository
                .findByPetOwnerIdOrderByCreatedAtDesc(owner.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ScanResultDTO getScanById(Long scanId, User owner) {
        ScanResult scan = scanResultRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException("Scan not found"));

        if (!scan.getPet().getOwner().getId().equals(owner.getId())) {
            throw new ResourceNotFoundException("Scan not found");
        }

        return mapToDTO(scan);
    }

    // ─────────────────────────────────────────────────────────
    // SAVE TO MEDICAL HISTORY
    // ─────────────────────────────────────────────────────────

    @Transactional
    public void saveToMedicalHistory(Long scanId, User owner) {
        ScanResult scan = scanResultRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException("Scan not found"));

        if (!scan.getPet().getOwner().getId().equals(owner.getId())) {
            throw new ResourceNotFoundException("Scan not found");
        }

        if (scan.isSavedToMedicalHistory()) {
            throw new BadRequestException("Scan already saved to medical history");
        }

        // Build medical record from scan result
        CreateMedicalRecordRequest req = new CreateMedicalRecordRequest();
        req.setType(RecordType.AI_SCAN);
        req.setTitle("AI Skin Analysis: " + scan.getPrediction());
        req.setDescription(
                String.format(
                        "AI detected '%s' with %.1f%% confidence. Severity: %s. %s",
                        scan.getPrediction(),
                        scan.getConfidence() * 100,
                        scan.getSeverity(),
                        scan.getGuidance() != null ? scan.getGuidance() : ""
                )
        );
        req.setDate(LocalDate.now());
        req.setNotes(
                scan.getRecommendations() != null
                        ? "Care steps: " + scan.getRecommendations().replace(";", " | ")
                        : ""
        );

        medicalService.createMedicalRecord(scan.getPet().getId(), req, owner);

        scan.setSavedToMedicalHistory(true);
        scanResultRepository.save(scan);

        log.info("Scan {} saved to medical history for pet {}",
                scanId, scan.getPet().getId());
    }

    // ─────────────────────────────────────────────────────────
    // FLASK HEALTH CHECK
    // ─────────────────────────────────────────────────────────

    public boolean isFlaskAlive() {
        try {
            ResponseEntity<String> resp = restTemplate.getForEntity(
                    aiServiceUrl + "/health", String.class
            );
            return resp.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("Flask health check failed: {}", e.getMessage());
            return false;
        }
    }

    // ─────────────────────────────────────────────────────────
    // MOCK FALLBACK
    // ─────────────────────────────────────────────────────────

    private AIAnalysisResponse buildMockResponse() {
        AIAnalysisResponse r = new AIAnalysisResponse();
        r.setPredictedClass("Bacterial Dermatitis");
        r.setPrediction("Bacterial Dermatitis");
        r.setConfidence(0.87);
        r.setSeverity(Severity.MODERATE);
        r.setGuidance(
                "This condition requires veterinary attention within 24-48 hours. " +
                        "Keep the affected area clean and prevent licking."
        );
        r.setDisclaimer(
                "⚠️ This AI analysis is a preliminary screening tool only. " +
                        "Always consult a licensed veterinarian."
        );
        r.setVetConnectTrigger(false);
        r.setRecommendations(Arrays.asList(
                "Keep the affected area clean and dry",
                "Prevent your pet from licking or scratching",
                "Book a vet appointment within 24-48 hours",
                "Monitor for fever or loss of appetite",
                "Do not apply human medications"
        ));
        r.setHomeCareSteps(r.getRecommendations());

        AIAnalysisResponse.PossibleCondition c1 = new AIAnalysisResponse.PossibleCondition();
        c1.setName("Bacterial Dermatitis"); c1.setProbability(0.87);
        AIAnalysisResponse.PossibleCondition c2 = new AIAnalysisResponse.PossibleCondition();
        c2.setName("Fungal Infection");     c2.setProbability(0.08);
        AIAnalysisResponse.PossibleCondition c3 = new AIAnalysisResponse.PossibleCondition();
        c3.setName("Allergic Reaction");    c3.setProbability(0.05);

        r.setAllPredictions(Arrays.asList(c1, c2, c3));
        r.setPossibleConditions(r.getAllPredictions());
        return r;
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────

    private Severity parseSeverity(String s) {
        try {
            return Severity.valueOf(s.toUpperCase());
        } catch (Exception e) {
            return Severity.MILD;
        }
    }

    private String joinList(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        return String.join(";", list);
    }

    private String serializeConditions(
            List<AIAnalysisResponse.PossibleCondition> conditions
    ) {
        try {
            return objectMapper.writeValueAsString(conditions);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private ScanResultDTO mapToDTO(ScanResult r) {
        // Split recommendations
        List<String> recommendations = (r.getRecommendations() != null
                && !r.getRecommendations().isBlank())
                ? Arrays.asList(r.getRecommendations().split(";"))
                : Collections.emptyList();

        // Deserialize possibleConditions JSON
        List<ScanResultDTO.PossibleConditionDTO> possibleConditions;
        try {
            List<AIAnalysisResponse.PossibleCondition> raw =
                    objectMapper.readValue(
                            r.getPossibleConditions() != null
                                    ? r.getPossibleConditions() : "[]",
                            new TypeReference<>() {}
                    );
            possibleConditions = raw.stream()
                    .map(c -> ScanResultDTO.PossibleConditionDTO.builder()
                            .name(c.getName())
                            .probability(c.getProbability())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            possibleConditions = Collections.emptyList();
        }

        return ScanResultDTO.builder()
                .id(r.getId())
                .imageUrl(r.getImageUrl())
                .prediction(r.getPrediction())
                .predictedClass(r.getPrediction())
                .confidence(r.getConfidence())
                .severity(r.getSeverity())
                .guidance(r.getGuidance())
                .disclaimer(r.getDisclaimer())
                .vetConnectTrigger(r.getVetConnectTriggered())
                .recommendations(recommendations)
                .homeCareSteps(recommendations)
                .possibleConditions(possibleConditions)
                .savedToMedicalHistory(r.isSavedToMedicalHistory())
                .petId(r.getPet().getId())
                .petName(r.getPet().getName())
                .petImage(r.getPet().getImage())
                .createdAt(r.getCreatedAt())
                .build();
    }
}