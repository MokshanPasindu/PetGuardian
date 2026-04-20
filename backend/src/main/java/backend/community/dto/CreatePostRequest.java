package backend.community.dto;

import backend.community.model.PostCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class CreatePostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 10, max = 200, message = "Title must be between 10 and 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 50, max = 5000, message = "Content must be between 50 and 5000 characters")
    private String content;

    @NotNull(message = "Category is required")
    private PostCategory category;

    // ✅ NEW: Tags (optional, max 5)
    @Size(max = 5, message = "Maximum 5 tags allowed")
    private Set<String> tags;
}