package backend.vet.controller;


import backend.vet.dto.NearbyVetRequest;
import backend.vet.dto.VetClinicDTO;
import backend.vet.service.VetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vets")
@RequiredArgsConstructor
@Tag(name = "Veterinary Clinics", description = "Vet clinic discovery APIs")
public class VetController {

    private final VetService vetService;

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
    @Operation(summary = "Search vet clinics")
    public ResponseEntity<List<VetClinicDTO>> searchVets(@RequestParam String query) {
        return ResponseEntity.ok(vetService.searchVets(query));
    }
}