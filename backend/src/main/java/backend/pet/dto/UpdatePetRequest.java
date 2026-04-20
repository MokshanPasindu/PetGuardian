package backend.pet.dto;


import backend.pet.model.PetType;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdatePetRequest {
    private String name;
    private PetType type;
    private String breed;

    @Past(message = "Birth date must be in the past")
    private LocalDate birthDate;

    private String gender;
    private Double weight;
    private String color;
    private String microchipId;
    private String notes;
}