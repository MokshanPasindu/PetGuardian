package backend.pet.controller;

import backend.common.dto.ApiResponse;
import backend.pet.dto.CreatePetRequest;
import backend.pet.dto.PetDTO;
import backend.pet.dto.UpdatePetRequest;
import backend.pet.service.PetService;
import backend.user.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
@Tag(name = "Pets", description = "Pet management APIs")
public class PetController {

    private final PetService petService;

    @GetMapping
    @Operation(summary = "Get all pets for current user")
    public ResponseEntity<List<PetDTO>> getMyPets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(petService.getPetsByOwner(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get pet by ID")
    public ResponseEntity<PetDTO> getPetById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(petService.getPetById(id, user));
    }

    @PostMapping
    @Operation(summary = "Create a new pet")
    public ResponseEntity<PetDTO> createPet(
            @Valid @ModelAttribute CreatePetRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(petService.createPet(request, image, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update pet")
    public ResponseEntity<PetDTO> updatePet(
            @PathVariable Long id,
            @Valid @ModelAttribute UpdatePetRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(petService.updatePet(id, request, image, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete pet")
    public ResponseEntity<ApiResponse> deletePet(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        petService.deletePet(id, user);
        return ResponseEntity.ok(new ApiResponse(true, "Pet deleted successfully"));
    }

    @PostMapping("/{id}/image")
    @Operation(summary = "Upload pet image")
    public ResponseEntity<PetDTO> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(petService.uploadImage(id, file, user));
    }

    @PostMapping("/{id}/generate-qr")
    @Operation(summary = "Regenerate QR code for pet")
    public ResponseEntity<ApiResponse> regenerateQrCode(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        String newQrCode = petService.regenerateQrCode(id, user);
        return ResponseEntity.ok(new ApiResponse(true, "QR code regenerated: " + newQrCode));
    }
}