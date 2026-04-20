package backend.vet.controller;


import backend.common.dto.ApiResponse;
import backend.user.model.User;
import backend.vet.dto.AppointmentDTO;
import backend.vet.dto.CreateAppointmentRequest;
import backend.vet.model.AppointmentStatus;
import backend.vet.service.AppointmentService;
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
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment management APIs")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @Operation(summary = "Get all appointments for current user")
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.getUserAppointments(user));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending appointments")
    public ResponseEntity<List<AppointmentDTO>> getPendingAppointments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.getPendingAppointments(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<AppointmentDTO> getAppointmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id, user));
    }

    @PostMapping
    @Operation(summary = "Create new appointment")
    public ResponseEntity<AppointmentDTO> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(request, user));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<AppointmentDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel appointment")
    public ResponseEntity<ApiResponse> cancelAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        appointmentService.cancelAppointment(id, user);
        return ResponseEntity.ok(new ApiResponse(true, "Appointment cancelled successfully"));
    }
}