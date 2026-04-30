// backend/breed/controller/BreedController.java
package backend.breed.controller;

import backend.breed.dto.BreedClassificationResponse;
import backend.breed.model.BreedScanResult;
import backend.breed.service.BreedService;
import backend.auth.security.JwtTokenProvider;
import backend.common.exception.ResourceNotFoundException;
import backend.user.model.User;
import backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/breed")
@CrossOrigin(origins = "*")
public class BreedController {

    @Autowired
    private BreedService breedService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER — Extract authenticated user's DB id from JWT Bearer token
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Flow:
     *   Authorization: Bearer <jwt>
     *         │
     *         ▼
     *   jwtTokenProvider.getUsernameFromToken(jwt)   →  "john@example.com"
     *         │
     *         ▼
     *   userRepository.findByEmail(email)            →  User entity
     *         │
     *         ▼
     *   user.getId()                                 →  42L
     *
     * User.getUsername() returns email  (confirmed from User.java)
     * so getUsernameFromToken() always returns the email string.
     */
    private Long extractUserId(HttpServletRequest request) {

        // Step 1 — Read Authorization header
        String bearerToken = request.getHeader("Authorization");

        // Step 2 — Validate it starts with "Bearer "
        if (!StringUtils.hasText(bearerToken) || !bearerToken.startsWith("Bearer ")) {
            throw new RuntimeException(
                    "Missing or invalid Authorization header. Expected: Bearer <token>"
            );
        }

        // Step 3 — Strip the "Bearer " prefix (7 characters)
        String token = bearerToken.substring(7);

        // Step 4 — Decode the subject (email) from JWT payload
        //          JwtTokenProvider.getUsernameFromToken() reads claims.getSubject()
        //          which was set to userDetails.getUsername() = User.getUsername() = email
        String email = jwtTokenProvider.getUsernameFromToken(token);

        // Step 5 — Load User from DB by email
        //          UserRepository.findByEmail() confirmed present in UserRepository.java
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        )
                );

        return user.getId();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/breed/classify
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Classify a pet image to detect breed and category.
     *
     * Request  : multipart/form-data
     *   - image  (required) — pet photo file
     *   - petId  (optional) — link result to an existing pet profile
     *
     * Response : BreedClassificationResponse JSON
     *
     * Roles    : OWNER, VET, ADMIN
     */
    @PostMapping(
            value    = "/classify",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('OWNER', 'VET', 'ADMIN')")
    public ResponseEntity<BreedClassificationResponse> classifyBreed(
            @RequestParam("image")                           MultipartFile imageFile,
            @RequestParam(value = "petId", required = false) Long          petId,
            HttpServletRequest                                              request
    ) {
        Long userId = extractUserId(request);

        BreedClassificationResponse response =
                breedService.classifyBreed(imageFile, userId, petId);

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/breed/history
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get all breed scan results for the currently authenticated user.
     * Results ordered by most recent first.
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('OWNER', 'VET', 'ADMIN')")
    public ResponseEntity<List<BreedScanResult>> getBreedScanHistory(
            HttpServletRequest request
    ) {
        Long userId = extractUserId(request);
        List<BreedScanResult> history = breedService.getUserBreedScans(userId);
        return ResponseEntity.ok(history);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/breed/pet/{petId}/history
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get all breed scan results linked to a specific pet profile.
     * Results ordered by most recent first.
     */
    @GetMapping("/pet/{petId}/history")
    @PreAuthorize("hasAnyRole('OWNER', 'VET', 'ADMIN')")
    public ResponseEntity<List<BreedScanResult>> getPetBreedScanHistory(
            @PathVariable Long petId
    ) {
        List<BreedScanResult> history = breedService.getPetBreedScans(petId);
        return ResponseEntity.ok(history);
    }
}