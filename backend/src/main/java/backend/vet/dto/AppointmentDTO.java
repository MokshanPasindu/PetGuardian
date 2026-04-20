package backend.vet.dto;


import backend.vet.model.AppointmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentDTO {
    private Long id;
    private LocalDate date;
    private LocalTime time;
    private String reason;
    private String notes;
    private AppointmentStatus status;
    private Long petId;
    private String petName;
    private String petImage;
    private Long clinicId;
    private String clinicName;
    private String clinicAddress;
    private LocalDateTime createdAt;
}