package backend.ai.dto;

import backend.ai.model.Severity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ScanResultDTO {
    private Long            id;
    private String          imageUrl;

    // Core prediction
    private String          prediction;
    private String          predictedClass;
    private Double          confidence;
    private Severity        severity;

    // Guidance
    private String          guidance;
    private String          disclaimer;
    private Boolean         vetConnectTrigger;

    // Lists
    private List<String>    recommendations;
    private List<String>    homeCareSteps;
    private List<PossibleConditionDTO> possibleConditions;

    // Status
    private boolean         savedToMedicalHistory;

    // Pet info
    private Long            petId;
    private String          petName;
    private String          petImage;

    private LocalDateTime   createdAt;

    @Data
    @Builder
    public static class PossibleConditionDTO {
        private String name;
        private Double probability;
    }
}