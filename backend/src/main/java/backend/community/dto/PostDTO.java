package backend.community.dto;

import backend.community.model.PostCategory;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private PostCategory category;
    private String imageUrl;
    private Set<String> tags; // ✅ NEW
    private boolean flagged; // ✅ NEW
    private String flagReason; // ✅ NEW
    private AuthorDTO author;
    private int likes;
    private int comments;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class AuthorDTO {
        private Long id;
        private String name;
        private String avatar;
    }
}