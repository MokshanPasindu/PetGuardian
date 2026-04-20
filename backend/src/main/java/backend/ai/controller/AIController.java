package backend.ai.controller;


import backend.ai.dto.ScanResultDTO;
import backend.ai.service.AIService;
import backend.common.dto.ApiResponse;
import backend.user.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Analysis", description = "AI skin analysis APIs")
public class AIController {

    private final AIService aiService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Analyze pet skin image with AI")
    public ResponseEntity<ScanResultDTO> analyzeSkinImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("petId") Long petId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.analyzeSkinImage(image, petId, user));
    }

    @GetMapping("/scans")
    @Operation(summary = "Get all scans for current user")
    public ResponseEntity<List<ScanResultDTO>> getAllScans(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.getAllUserScans(user));
    }

    @GetMapping("/scans/{petId}")
    @Operation(summary = "Get scan history for a pet")
    public ResponseEntity<List<ScanResultDTO>> getScanHistory(
            @PathVariable Long petId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.getScanHistory(petId, user));
    }

    @GetMapping("/scans/detail/{scanId}")
    @Operation(summary = "Get scan details by ID")
    public ResponseEntity<ScanResultDTO> getScanById(
            @PathVariable Long scanId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.getScanById(scanId, user));
    }

    @PostMapping("/scans/{scanId}/save-to-history")
    @Operation(summary = "Save scan result to medical history")
    public ResponseEntity<ApiResponse> saveToMedicalHistory(
            @PathVariable Long scanId,
            @AuthenticationPrincipal User user) {
        aiService.saveToMedicalHistory(scanId, user);
        return ResponseEntity.ok(new ApiResponse(true, "Scan saved to medical history"));
    }
}
