package backend.pet.dto;


import backend.pet.model.PetType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PetDTO {
    private Long id;
    private String name;
    private PetType type;
    private String breed;
    private LocalDate birthDate;
    private String gender;
    private Double weight;
    private String color;
    private String microchipId;
    private String image;
    private String notes;
    private String qrCode;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
}