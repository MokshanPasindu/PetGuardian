package backend.ai.service;


import backend.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import backend.ai.dto.AIAnalysisResponse;
import backend.ai.dto.ScanResultDTO;
import backend.ai.model.ScanResult;
import backend.ai.model.Severity;
import backend.ai.repository.ScanResultRepository;
import backend.common.exception.BadRequestException;
import backend.medical.dto.CreateMedicalRecordRequest;
import backend.medical.model.RecordType;
import backend.medical.service.MedicalService;
import backend.pet.model.Pet;
import backend.pet.repository.PetRepository;
import backend.storage.StorageService;
import backend.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final ScanResultRepository scanResultRepository;
    private final PetRepository petRepository;
    private final StorageService storageService;
    private final MedicalService medicalService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ai.service.url}")
    private String aiServiceUrl;

    @Transactional
    public ScanResultDTO analyzeSkinImage(MultipartFile image, Long petId, User owner) {
        // Validate pet ownership
        Pet pet = petRepository.findByIdAndOwnerId(petId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        // Store image
        String imageUrl = storageService.store(image, "scans");

        // Call AI service
        AIAnalysisResponse aiResponse = callAIService(image);

        // If AI service is not available, return mock data
        if (aiResponse == null) {
            aiResponse = getMockAIResponse();
        }

        // Save scan result
        ScanResult scanResult = ScanResult.builder()
                .imageUrl(imageUrl)
                .prediction(aiResponse.getPrediction())
                .confidence(aiResponse.getConfidence())
                .severity(aiResponse.getSeverity())
                .recommendations(String.join(";", aiResponse.getRecommendations()))
                .possibleConditions(serializePossibleConditions(aiResponse.getPossibleConditions()))
                .pet(pet)
                .savedToMedicalHistory(false)
                .build();

        ScanResult savedResult = scanResultRepository.save(scanResult);

        return mapToDTO(savedResult);
    }

    public List<ScanResultDTO> getScanHistory(Long petId, User owner) {
        petRepository.findByIdAndOwnerId(petId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        return scanResultRepository.findByPetIdOrderByCreatedAtDesc(petId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ScanResultDTO> getAllUserScans(User owner) {
        return scanResultRepository.findByPetOwnerIdOrderByCreatedAtDesc(owner.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ScanResultDTO getScanById(Long scanId, User owner) {
        ScanResult scanResult = scanResultRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException("Scan result not found"));

        if (!scanResult.getPet().getOwner().getId().equals(owner.getId())) {
            throw new ResourceNotFoundException("Scan result not found");
        }

        return mapToDTO(scanResult);
    }

    @Transactional
    public void saveToMedicalHistory(Long scanId, User owner) {
        ScanResult scanResult = scanResultRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException("Scan result not found"));

        if (!scanResult.getPet().getOwner().getId().equals(owner.getId())) {
            throw new ResourceNotFoundException("Scan result not found");
        }

        if (scanResult.isSavedToMedicalHistory()) {
            throw new BadRequestException("Scan already saved to medical history");
        }

        // Create medical record from scan
        CreateMedicalRecordRequest recordRequest = new CreateMedicalRecordRequest();
        recordRequest.setType(RecordType.AI_SCAN);
        recordRequest.setTitle("AI Skin Analysis: " + scanResult.getPrediction());
        recordRequest.setDescription("AI-detected condition with " +
                String.format("%.1f", scanResult.getConfidence() * 100) + "% confidence. " +
                "Severity: " + scanResult.getSeverity());
        recordRequest.setDate(LocalDate.now());
        recordRequest.setNotes("Recommendations: " + scanResult.getRecommendations());

        medicalService.createMedicalRecord(scanResult.getPet().getId(), recordRequest, owner);

        scanResult.setSavedToMedicalHistory(true);
        scanResultRepository.save(scanResult);
    }

    private AIAnalysisResponse callAIService(MultipartFile image) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<AIAnalysisResponse> response = restTemplate.exchange(
                    aiServiceUrl + "/analyze",
                    HttpMethod.POST,
                    requestEntity,
                    AIAnalysisResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling AI service: {}", e.getMessage());
            return null;
        }
    }

    private AIAnalysisResponse getMockAIResponse() {
        AIAnalysisResponse response = new AIAnalysisResponse();
        response.setPrediction("Bacterial Dermatitis");
        response.setConfidence(0.87);
        response.setSeverity(Severity.MODERATE);
        response.setRecommendations(Arrays.asList(
                "Keep the affected area clean and dry",
                "Avoid scratching or irritating the area",
                "Consider scheduling a vet appointment within the next few days",
                "Monitor for any changes in size or appearance",
                "Apply pet-safe antiseptic if recommended by your vet"
        ));

        AIAnalysisResponse.PossibleCondition condition1 = new AIAnalysisResponse.PossibleCondition();
        condition1.setName("Bacterial Dermatitis");
        condition1.setProbability(0.87);

        AIAnalysisResponse.PossibleCondition condition2 = new AIAnalysisResponse.PossibleCondition();
        condition2.setName("Fungal Infection");
        condition2.setProbability(0.08);

        AIAnalysisResponse.PossibleCondition condition3 = new AIAnalysisResponse.PossibleCondition();
        condition3.setName("Allergic Reaction");
        condition3.setProbability(0.05);

        response.setPossibleConditions(Arrays.asList(condition1, condition2, condition3));

        return response;
    }

    private String serializePossibleConditions(List<AIAnalysisResponse.PossibleCondition> conditions) {
        try {
            return objectMapper.writeValueAsString(conditions);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private ScanResultDTO mapToDTO(ScanResult result) {
        List<String> recommendations = result.getRecommendations() != null
                ? Arrays.asList(result.getRecommendations().split(";"))
                : List.of();

        List<ScanResultDTO.PossibleConditionDTO> possibleConditions;
        try {
            AIAnalysisResponse.PossibleCondition[] conditions = objectMapper.readValue(
                    result.getPossibleConditions(),
                    AIAnalysisResponse.PossibleCondition[].class
            );
            possibleConditions = Arrays.stream(conditions)
                    .map(c -> ScanResultDTO.PossibleConditionDTO.builder()
                            .name(c.getName())
                            .probability(c.getProbability())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            possibleConditions = List.of();
        }

        return ScanResultDTO.builder()
                .id(result.getId())
                .imageUrl(result.getImageUrl())
                .prediction(result.getPrediction())
                .confidence(result.getConfidence())
                .severity(result.getSeverity())
                .recommendations(recommendations)
                .possibleConditions(possibleConditions)
                .savedToMedicalHistory(result.isSavedToMedicalHistory())
                .petId(result.getPet().getId())
                .petName(result.getPet().getName())
                .petImage(result.getPet().getImage())
                .createdAt(result.getCreatedAt())
                .build();
    }
}