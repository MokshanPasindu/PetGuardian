package backend.medical.dto;

import backend.medical.model.RecordType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateMedicalRecordRequest {

    @NotNull(message = "Record type is required")
    private RecordType type;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String vetName;

    private String clinicName;

    private String notes;

    private String prescription;
}