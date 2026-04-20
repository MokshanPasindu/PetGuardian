package backend.user.dto;

import backend.user.model.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String avatar;
    private Role role;
    private boolean enabled; // ✅ Add this field
    private LocalDateTime createdAt;
}