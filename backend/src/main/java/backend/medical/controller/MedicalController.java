package backend.medical.controller;


import backend.common.dto.ApiResponse;
import backend.medical.dto.*;
import backend.medical.model.RecordType;
import backend.medical.service.MedicalService;
import backend.user.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
@Tag(name = "Medical Records", description = "Medical records and vaccination management APIs")
public class MedicalController {

    private final MedicalService medicalService;

    // Health Summary
    @GetMapping("/{petId}/summary")
    @Operation(summary = "Get pet health summary")
    public ResponseEntity<HealthSummaryDTO> getHealthSummary(
            @PathVariable Long petId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(medicalService.getHealthSummary(petId, user));
    }

    // Medical Records
    @GetMapping("/{petId}/history")
    @Operation(summary = "Get pet medical history")
    public ResponseEntity<List<MedicalRecordDTO>> getMedicalHistory(
            @PathVariable Long petId,
            @RequestParam(required = false) RecordType type,
            @AuthenticationPrincipal User user) {
        if (type != null) {
            return ResponseEntity.ok(medicalService.getMedicalHistoryByType(petId, type, user));
        }
        return ResponseEntity.ok(medicalService.getMedicalHistory(petId, user));
    }

    @GetMapping("/{petId}/records/{recordId}")
    @Operation(summary = "Get specific medical record")
    public ResponseEntity<MedicalRecordDTO> getMedicalRecord(
            @PathVariable Long petId,
            @PathVariable Long recordId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(medicalService.getMedicalRecordById(petId, recordId, user));
    }

    @PostMapping("/{petId}/records")
    @Operation(summary = "Create medical record")
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(
            @PathVariable Long petId,
            @Valid @RequestBody CreateMedicalRecordRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicalService.createMedicalRecord(petId, request, user));
    }

    @PutMapping("/{petId}/records/{recordId}")
    @Operation(summary = "Update medical record")
    public ResponseEntity<MedicalRecordDTO> updateMedicalRecord(
            @PathVariable Long petId,
            @PathVariable Long recordId,
            @Valid @RequestBody CreateMedicalRecordRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(medicalService.updateMedicalRecord(petId, recordId, request, user));
    }

    @DeleteMapping("/{petId}/records/{recordId}")
    @Operation(summary = "Delete medical record")
    public ResponseEntity<ApiResponse> deleteMedicalRecord(
            @PathVariable Long petId,
            @PathVariable Long recordId,
            @AuthenticationPrincipal User user) {
        medicalService.deleteMedicalRecord(petId, recordId, user);
        return ResponseEntity.ok(new ApiResponse(true, "Medical record deleted successfully"));
    }

    // Vaccinations
    @GetMapping("/{petId}/vaccinations")
    @Operation(summary = "Get pet vaccinations")
    public ResponseEntity<List<VaccinationDTO>> getVaccinations(
            @PathVariable Long petId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(medicalService.getVaccinations(petId, user));
    }

    @PostMapping("/{petId}/vaccinations")
    @Operation(summary = "Create vaccination record")
    public ResponseEntity<VaccinationDTO> createVaccination(
            @PathVariable Long petId,
            @Valid @RequestBody CreateVaccinationRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicalService.createVaccination(petId, request, user));
    }

    @PutMapping("/{petId}/vaccinations/{vaccinationId}")
    @Operation(summary = "Update vaccination record")
    public ResponseEntity<VaccinationDTO> updateVaccination(
            @PathVariable Long petId,
            @PathVariable Long vaccinationId,
            @Valid @RequestBody CreateVaccinationRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(medicalService.updateVaccination(petId, vaccinationId, request, user));
    }

    @DeleteMapping("/{petId}/vaccinations/{vaccinationId}")
    @Operation(summary = "Delete vaccination record")
    public ResponseEntity<ApiResponse> deleteVaccination(
            @PathVariable Long petId,
            @PathVariable Long vaccinationId,
            @AuthenticationPrincipal User user) {
        medicalService.deleteVaccination(petId, vaccinationId, user);
        return ResponseEntity.ok(new ApiResponse(true, "Vaccination record deleted successfully"));
    }
}