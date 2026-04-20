package backend.vet.dto;


import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class VetClinicDTO {
    private Long id;
    private String name;
    private String specialization;
    private String address;
    private String phone;
    private String email;
    private String hours;
    private String image;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer reviewCount;
    private boolean isEmergency;
    private boolean isOpen;
    private List<String> services;
    private String description;
    private Double distance;
}