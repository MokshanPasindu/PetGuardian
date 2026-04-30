// backend/vet/controller/VetController.java
package backend.vet.controller;

import backend.common.dto.ApiResponse;
import backend.vet.dto.NearbyVetRequest;
import backend.vet.dto.VetClinicDTO;
import backend.vet.dto.VetClinicRequest;
import backend.vet.service.VetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vets")
@RequiredArgsConstructor
@Tag(name = "Veterinary Clinics", description = "Vet clinic discovery and management APIs")
public class VetController {

    private final VetService vetService;

    // ─── Public / All Authenticated Users ───────────────────────────────────

    @GetMapping
    @Operation(summary = "Get all vet clinics")
    public ResponseEntity<List<VetClinicDTO>> getAllVets() {
        return ResponseEntity.ok(vetService.getAllVets());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vet clinic by ID")
    public ResponseEntity<VetClinicDTO> getVetById(@PathVariable Long id) {
        return ResponseEntity.ok(vetService.getVetById(id));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get nearby vet clinics")
    public ResponseEntity<List<VetClinicDTO>> getNearbyVets(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "10") Double radius) {
        NearbyVetRequest request = new NearbyVetRequest();
        request.setLat(lat);
        request.setLng(lng);
        request.setRadius(radius);
        return ResponseEntity.ok(vetService.getNearbyVets(request));
    }

    @GetMapping("/emergency")
    @Operation(summary = "Get emergency vet clinics")
    public ResponseEntity<List<VetClinicDTO>> getEmergencyVets() {
        return ResponseEntity.ok(vetService.getEmergencyVets());
    }

    @GetMapping("/search")
    @Operation(summary = "Search vet clinics by name")
    public ResponseEntity<List<VetClinicDTO>> searchVets(
            @RequestParam String query) {
        return ResponseEntity.ok(vetService.searchVets(query));
    }

    // ─── Admin Only ──────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new vet clinic (Admin only)")
    public ResponseEntity<VetClinicDTO> createClinic(
            @Valid @RequestBody VetClinicRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(vetService.createClinic(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a vet clinic (Admin only)")
    public ResponseEntity<VetClinicDTO> updateClinic(
            @PathVariable Long id,
            @Valid @RequestBody VetClinicRequest request) {
        return ResponseEntity.ok(vetService.updateClinic(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a vet clinic (Admin only)")
    public ResponseEntity<ApiResponse> deleteClinic(@PathVariable Long id) {
        vetService.deleteClinic(id);
        return ResponseEntity.ok(new ApiResponse(true, "Clinic deleted successfully"));
    }
}