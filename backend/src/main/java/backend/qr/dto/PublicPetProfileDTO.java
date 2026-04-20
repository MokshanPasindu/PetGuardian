package backend.qr.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicPetProfileDTO {
    private Long id;
    private String name;
    private String type;
    private String breed;
    private String gender;
    private String color;
    private String image;
    private String age;
    private String microchipId;
    private String medicalNotes;
    private OwnerContactDTO owner;

    @Data
    @Builder
    public static class OwnerContactDTO {
        private String name;
        private String phone;
        private String email;
        private String area;
    }
}