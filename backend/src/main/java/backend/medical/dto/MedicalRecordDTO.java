package backend.medical.dto;


import backend.medical.model.RecordType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class MedicalRecordDTO {
    private Long id;
    private RecordType type;
    private String title;
    private String description;
    private LocalDate date;
    private String vetName;
    private String clinicName;
    private String notes;
    private String prescription;
    private String attachmentUrl;
    private Long petId;
    private String petName;
    private LocalDateTime createdAt;
}