package backend.community.repository;

import backend.community.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Get top-level comments (no parent)
    List<Comment> findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(Long postId);

    // Get all comments for a post (including nested)
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);

    // ✅ NEW: Get replies for a comment
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(Long parentCommentId);
}