package backend.vet.dto;


import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateAppointmentRequest {

    @NotNull(message = "Pet ID is required")
    private Long petId;

    @NotNull(message = "Clinic ID is required")
    private Long clinicId;

    @NotNull(message = "Date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDate date;

    @NotNull(message = "Time is required")
    private LocalTime time;

    private String reason;

    private String notes;
}