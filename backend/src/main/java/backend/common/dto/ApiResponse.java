package backend.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    // ✅ Constructor for simple responses (matching your PetController pattern)
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}