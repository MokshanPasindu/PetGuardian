package backend.community.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentDTO {
    private Long id;
    private String content;
    private PostDTO.AuthorDTO author;
    private Long parentCommentId; // ✅ NEW
    private List<CommentDTO> replies; // ✅ NEW
    private int replyCount; // ✅ NEW
    private int likes;
    private boolean likedByCurrentUser;
    private boolean edited; // ✅ NEW
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // ✅ NEW
}