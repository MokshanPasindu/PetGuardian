package backend.medical.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateVaccinationRequest {

    @NotBlank(message = "Vaccination name is required")
    private String name;

    @NotNull(message = "Date administered is required")
    private LocalDate dateAdministered;

    @NotNull(message = "Next due date is required")
    private LocalDate nextDueDate;

    private String batchNumber;

    private String manufacturer;

    private String administeredBy;

    private String clinicName;

    private String notes;
}