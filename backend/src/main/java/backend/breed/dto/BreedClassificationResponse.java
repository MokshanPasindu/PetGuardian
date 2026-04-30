// backend/breed/dto/BreedClassificationResponse.java
package backend.breed.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

/**
 * Maps the inner "data" object from Flask format_success() envelope.
 *
 * Flask breed_predictor.predict() returns:
 * {
 *   "predictedBreed":    "Beagle",
 *   "predictedCategory": "Dog",
 *   "confidence":        94.25,
 *   "topPredictions":    [ { "breed", "category", "confidence" } ],
 *   "healthNotes":       { "care_tips", "common_conditions", ... },
 *   "totalClasses":      6
 * }
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class BreedClassificationResponse {

    // Set manually after unwrapping Flask envelope
    private boolean success;

    @JsonProperty("predictedBreed")
    private String predictedBreed;

    @JsonProperty("predictedCategory")
    private String predictedCategory;

    @JsonProperty("confidence")
    private double confidence;

    @JsonProperty("topPredictions")
    private List<TopPrediction> topPredictions;

    // healthNotes is a flexible dict → Map<String, Object>
    @JsonProperty("healthNotes")
    private Map<String, Object> healthNotes;

    @JsonProperty("totalClasses")
    private int totalClasses;

    // Set when success = false
    private String errorMessage;

    // ── Nested DTO — top-3 predictions ───────────────────────────────────────
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TopPrediction {

        @JsonProperty("breed")
        private String breed;

        @JsonProperty("category")
        private String category;

        @JsonProperty("confidence")
        private double confidence;

        public String getBreed()                       { return breed; }
        public void   setBreed(String breed)           { this.breed = breed; }

        public String getCategory()                    { return category; }
        public void   setCategory(String category)     { this.category = category; }

        public double getConfidence()                  { return confidence; }
        public void   setConfidence(double confidence) { this.confidence = confidence; }
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public boolean isSuccess()             { return success; }
    public void    setSuccess(boolean s)   { this.success = s; }

    public String getPredictedBreed()                      { return predictedBreed; }
    public void   setPredictedBreed(String predictedBreed) { this.predictedBreed = predictedBreed; }

    public String getPredictedCategory()                         { return predictedCategory; }
    public void   setPredictedCategory(String predictedCategory) { this.predictedCategory = predictedCategory; }

    public double getConfidence()                  { return confidence; }
    public void   setConfidence(double confidence) { this.confidence = confidence; }

    public List<TopPrediction> getTopPredictions()                       { return topPredictions; }
    public void                setTopPredictions(List<TopPrediction> tp) { this.topPredictions = tp; }

    public Map<String, Object> getHealthNotes()                        { return healthNotes; }
    public void                setHealthNotes(Map<String, Object> hn)  { this.healthNotes = hn; }

    public int  getTotalClasses()          { return totalClasses; }
    public void setTotalClasses(int total) { this.totalClasses = total; }

    public String getErrorMessage()                      { return errorMessage; }
    public void   setErrorMessage(String errorMessage)   { this.errorMessage = errorMessage; }
}