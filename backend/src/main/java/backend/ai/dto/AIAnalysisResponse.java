package backend.ai.dto;


import backend.ai.model.Severity;
import lombok.Data;

import java.util.List;

@Data
public class AIAnalysisResponse {
    private String prediction;
    private Double confidence;
    private Severity severity;
    private List<String> recommendations;
    private List<PossibleCondition> possibleConditions;

    @Data
    public static class PossibleCondition {
        private String name;
        private Double probability;
    }
}
