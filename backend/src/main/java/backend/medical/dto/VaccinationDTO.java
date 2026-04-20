package backend.medical.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class VaccinationDTO {
    private Long id;
    private String name;
    private LocalDate dateAdministered;
    private LocalDate nextDueDate;
    private String batchNumber;
    private String manufacturer;
    private String administeredBy;
    private String clinicName;
    private String notes;
    private String status;
    private Long petId;
    private String petName;
    private LocalDateTime createdAt;
}