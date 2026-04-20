package backend.ai.dto;


import backend.ai.model.Severity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ScanResultDTO {
    private Long id;
    private String imageUrl;
    private String prediction;
    private Double confidence;
    private Severity severity;
    private List<String> recommendations;
    private List<PossibleConditionDTO> possibleConditions;
    private boolean savedToMedicalHistory;
    private Long petId;
    private String petName;
    private String petImage;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class PossibleConditionDTO {
        private String name;
        private Double probability;
    }
}