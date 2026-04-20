package backend.pet.dto;



import backend.pet.model.PetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreatePetRequest {

    @NotBlank(message = "Pet name is required")
    private String name;

    @NotNull(message = "Pet type is required")
    private PetType type;

    private String breed;

    @NotNull(message = "Birth date is required")
    @Past(message = "Birth date must be in the past")
    private LocalDate birthDate;

    private String gender;

    private Double weight;

    private String color;

    private String microchipId;

    private String notes;
}