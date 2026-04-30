package backend.ai.dto;

import backend.ai.model.Severity;
import lombok.Data;

import java.util.List;

@Data
public class AIAnalysisResponse {
    // Flask response fields
    private String          predictedClass;
    private Double          confidence;
    private Severity        severity;
    private String          guidance;
    private String          disclaimer;
    private Boolean         vetConnectTrigger;
    private List<String>    homeCareSteps;
    private List<PossibleCondition> allPredictions;

    // Mapped fields for frontend compatibility
    private String          prediction;       // alias for predictedClass
    private List<String>    recommendations;  // alias for homeCareSteps
    private List<PossibleCondition> possibleConditions; // alias for allPredictions

    @Data
    public static class PossibleCondition {
        private String name;        // maps from Flask "class"
        private Double probability; // maps from Flask "confidence"
    }
}