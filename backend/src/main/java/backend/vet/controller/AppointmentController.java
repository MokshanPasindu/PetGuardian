package backend.vet.controller;

import backend.common.dto.ApiResponse;
import backend.user.model.User;
import backend.vet.dto.AppointmentDTO;
import backend.vet.dto.CreateAppointmentRequest;
import backend.vet.dto.VetDashboardDTO;
import backend.vet.model.AppointmentStatus;
import backend.vet.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment management APIs")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ═══════════════════════════════════════════════════════════
    // OWNER ENDPOINTS
    // ═══════════════════════════════════════════════════════════

    @GetMapping
    @Operation(summary = "Get all appointments for current user")
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.getUserAppointments(user)
        );
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending appointments for current user")
    public ResponseEntity<List<AppointmentDTO>> getPendingAppointments(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.getPendingAppointments(user)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<AppointmentDTO> getAppointmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.getAppointmentById(id, user)
        );
    }

    @PostMapping
    @Operation(summary = "Create new appointment")
    public ResponseEntity<AppointmentDTO> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(request, user));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<AppointmentDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.updateAppointmentStatus(id, status, user)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel appointment")
    public ResponseEntity<ApiResponse> cancelAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        appointmentService.cancelAppointment(id, user);
        return ResponseEntity.ok(
                new ApiResponse(true, "Appointment cancelled successfully")
        );
    }

    // ═══════════════════════════════════════════════════════════
    // VET ENDPOINTS
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/vet/all")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Get all appointments for vet's clinic")
    public ResponseEntity<List<AppointmentDTO>> getVetAppointments(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.getVetAppointments(user)
        );
    }

    @GetMapping("/vet/today")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Get today's appointments for vet")
    public ResponseEntity<List<AppointmentDTO>> getTodayAppointments(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.getTodayAppointments(user)
        );
    }

    @GetMapping("/vet/pending")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Get pending appointments for vet")
    public ResponseEntity<List<AppointmentDTO>> getVetPendingAppointments(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.getVetPendingAppointments(user)
        );
    }

    @GetMapping("/vet/date")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Get appointments by date for vet")
    public ResponseEntity<List<AppointmentDTO>> getVetAppointmentsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.getVetAppointmentsByDate(date, user)
        );
    }

    @PatchMapping("/vet/{id}/confirm")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Confirm an appointment")
    public ResponseEntity<AppointmentDTO> confirmAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.vetUpdateStatus(id, AppointmentStatus.CONFIRMED, user)
        );
    }

    @PatchMapping("/vet/{id}/complete")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Mark appointment as completed")
    public ResponseEntity<AppointmentDTO> completeAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.vetUpdateStatus(id, AppointmentStatus.COMPLETED, user)
        );
    }

    @PatchMapping("/vet/{id}/cancel")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Vet cancels an appointment")
    public ResponseEntity<AppointmentDTO> vetCancelAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.vetUpdateStatus(id, AppointmentStatus.CANCELLED, user)
        );
    }

    @PatchMapping("/vet/{id}/notes")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Add vet notes to appointment")
    public ResponseEntity<AppointmentDTO> addVetNotes(
            @PathVariable Long id,
            @RequestParam String notes,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.addVetNotes(id, notes, user)
        );
    }

    @GetMapping("/vet/dashboard")
    @PreAuthorize("hasRole('VET')")
    @Operation(summary = "Get vet dashboard statistics")
    public ResponseEntity<VetDashboardDTO> getVetDashboard(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                appointmentService.getVetDashboard(user)
        );
    }
}