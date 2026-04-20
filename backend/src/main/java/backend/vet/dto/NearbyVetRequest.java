package backend.vet.dto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NearbyVetRequest {

    @NotNull(message = "Latitude is required")
    private Double lat;

    @NotNull(message = "Longitude is required")
    private Double lng;

    private Double radius = 10.0; // Default 10km
}