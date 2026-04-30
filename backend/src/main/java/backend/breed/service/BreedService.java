// backend/breed/service/BreedService.java
package backend.breed.service;

import backend.breed.dto.BreedClassificationResponse;
import backend.breed.model.BreedScanResult;
import backend.breed.repository.BreedScanResultRepository;
import backend.common.exception.ResourceNotFoundException;
import backend.pet.repository.PetRepository;
import backend.storage.StorageService;
import backend.user.model.User;
import backend.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BreedService {

    // ── Flask AI Service base URL ─────────────────────────────────────────────
    // Reads from application.properties:  app.ai.service.url=http://localhost:5000
    @Value("${app.ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    @Autowired
    private BreedScanResultRepository breedScanResultRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    // ── Use StorageService interface (FileStorageService implements this) ──────
    // StorageService.store(file, folder) confirmed from StorageService.java
    @Autowired
    private StorageService storageService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper  = new ObjectMapper();

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC — Classify breed
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Main entry point called by BreedController.
     *
     * Flow:
     *   1. POST image to Flask /api/breed/classify
     *   2. Unwrap format_success() envelope  → parse BreedClassificationResponse
     *   3. Save result to breed_scan_results table
     *   4. Return DTO to controller
     */
    public BreedClassificationResponse classifyBreed(
            MultipartFile imageFile,
            Long          userId,
            Long          petId
    ) {
        try {
            // Step 1 + 2 — Call Flask and parse response
            BreedClassificationResponse aiResponse = callFlaskBreedAPI(imageFile);

            // Step 3 — Persist to DB if prediction succeeded
            if (aiResponse != null && aiResponse.isSuccess()) {
                saveBreedScanResult(aiResponse, imageFile, userId, petId);
            }

            return aiResponse;

        } catch (ResourceAccessException e) {
            // Flask service is down / unreachable
            log.error("[BreedService] Flask AI service unreachable: {}", e.getMessage());
            return buildErrorResponse(
                    "AI service is currently unavailable. Please try again later."
            );

        } catch (HttpClientErrorException e) {
            log.error("[BreedService] Flask client error {}: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return buildErrorResponse("Invalid request to AI service: " + e.getMessage());

        } catch (HttpServerErrorException e) {
            log.error("[BreedService] Flask server error {}: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return buildErrorResponse("AI service error. Please try again.");

        } catch (Exception e) {
            log.error("[BreedService] Unexpected error during breed classification: {}",
                    e.getMessage(), e);
            return buildErrorResponse("Breed classification failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE — Call Flask /api/breed/classify
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Flask response envelope from format_success():
     * {
     *   "success":   true,
     *   "message":   "Breed classification successful",
     *   "data": {
     *     "predictedBreed":    "Beagle",
     *     "predictedCategory": "Dog",
     *     "confidence":        94.25,
     *     "topPredictions":    [...],
     *     "healthNotes":       {...},
     *     "totalClasses":      6
     *   },
     *   "timestamp": "..."
     * }
     *
     * We unwrap the "data" field and map it to BreedClassificationResponse.
     */
    @SuppressWarnings("unchecked")
    private BreedClassificationResponse callFlaskBreedAPI(
            MultipartFile imageFile
    ) throws Exception {

        String url = aiServiceUrl + "/api/breed/classify";
        log.info("[BreedService] Calling Flask at: {}", url);

        // Build multipart/form-data headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // Build request body with image file
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new ByteArrayResource(imageFile.getBytes()) {
            @Override
            public String getFilename() {
                // RestTemplate requires a non-null filename for multipart upload
                String original = imageFile.getOriginalFilename();
                return (original != null && !original.isEmpty()) ? original : "image.jpg";
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        // POST to Flask — response body is Map<String, Object>
        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                Map.class
        );

        Map<String, Object> responseBody = response.getBody();

        if (responseBody == null) {
            throw new RuntimeException("Received null response body from Flask AI service.");
        }

        log.debug("[BreedService] Flask raw response: {}", responseBody);

        // ── Unwrap format_success() envelope ──────────────────────────────────
        // Flask wraps results in: { "success": true, "data": { actual result } }
        // We need to extract the inner "data" object
        Object dataObj = responseBody.get("data");

        if (dataObj instanceof Map) {
            // Map the inner "data" object to BreedClassificationResponse DTO
            BreedClassificationResponse dto =
                    objectMapper.convertValue(dataObj, BreedClassificationResponse.class);
            dto.setSuccess(true);
            return dto;
        }

        // Fallback — try mapping the entire response body directly
        log.warn("[BreedService] Could not find 'data' field in Flask response. " +
                "Attempting direct mapping.");
        return objectMapper.convertValue(responseBody, BreedClassificationResponse.class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE — Save breed scan result to database
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Persists the AI result to breed_scan_results table.
     * Uses StorageService.store(file, folder) — confirmed from StorageService.java
     * Non-fatal: logs warning on failure but does NOT fail the API response.
     */
    private void saveBreedScanResult(
            BreedClassificationResponse response,
            MultipartFile               imageFile,
            Long                        userId,
            Long                        petId
    ) {
        try {
            // Load authenticated user from DB
            User user = userRepository.findById(userId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User not found with id: " + userId
                            )
                    );

            // Build entity
            BreedScanResult result = new BreedScanResult();
            result.setUser(user);
            result.setPredictedBreed(response.getPredictedBreed());
            result.setPredictedCategory(response.getPredictedCategory());
            result.setConfidence(response.getConfidence());

            // Optionally link to existing pet profile
            if (petId != null) {
                petRepository.findById(petId).ifPresent(pet -> {
                    result.setPet(pet);
                    result.setUsedForRegistration(true);
                });
            }

            // Store image using StorageService.store(file, folder)
            // Confirmed signature: store(MultipartFile file, String folder) → String path
            String imagePath = storageService.store(imageFile, "breed-scans");
            result.setImagePath(imagePath);

            breedScanResultRepository.save(result);
            log.info("[BreedService] Breed scan result saved for userId={}", userId);

        } catch (Exception e) {
            // Non-fatal — prediction already returned to user successfully
            log.warn("[BreedService] Could not save breed scan result to DB: {}",
                    e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE — Build error response DTO
    // ─────────────────────────────────────────────────────────────────────────
    private BreedClassificationResponse buildErrorResponse(String message) {
        BreedClassificationResponse error = new BreedClassificationResponse();
        error.setSuccess(false);
        error.setErrorMessage(message);
        return error;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC — Query scan history
    // ─────────────────────────────────────────────────────────────────────────

    /** All breed scans done by a specific user, newest first */
    public List<BreedScanResult> getUserBreedScans(Long userId) {
        return breedScanResultRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    /** All breed scans linked to a specific pet, newest first */
    public List<BreedScanResult> getPetBreedScans(Long petId) {
        return breedScanResultRepository
                .findByPetIdOrderByCreatedAtDesc(petId);
    }
}