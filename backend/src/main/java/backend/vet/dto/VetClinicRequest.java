// backend/vet/dto/VetClinicRequest.java
package backend.vet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class VetClinicRequest {

    @NotBlank(message = "Clinic name is required")
    private String name;

    private String specialization;

    @NotBlank(message = "Address is required")
    private String address;

    private String phone;

    private String email;

    private String hours;

    private String image;

    private Double latitude;

    private Double longitude;

    @DecimalMin(value = "0.0", message = "Rating must be at least 0")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5")
    private Double rating;

    private Integer reviewCount;

    private boolean isEmergency;

    private boolean isOpen;

    private String services; // comma-separated

    private String description;
}