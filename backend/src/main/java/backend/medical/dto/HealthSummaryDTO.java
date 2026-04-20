package backend.medical.dto;


import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class HealthSummaryDTO {
    private Long petId;
    private String petName;
    private LocalDate lastCheckup;
    private LocalDate nextVaccination;
    private Double currentWeight;
    private String weightTrend;
    private String overallHealth;
    private int totalRecords;
    private int upcomingVaccinations;
    private int overdueVaccinations;
    private List<MedicalRecordDTO> recentRecords;
    private List<HealthAlertDTO> alerts;

    @Data
    @Builder
    public static class HealthAlertDTO {
        private String type;
        private String message;
        private String severity;
    }
}