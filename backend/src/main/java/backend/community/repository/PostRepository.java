package backend.community.repository;

import backend.community.model.Post;
import backend.community.model.PostCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByCategoryOrderByCreatedAtDesc(PostCategory category, Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY SIZE(p.likes) DESC, p.createdAt DESC")
    Page<Post> findTrendingPosts(Pageable pageable);

    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT p FROM Post p WHERE p.title LIKE %:query% OR p.content LIKE %:query%")
    Page<Post> searchPosts(String query, Pageable pageable);

    // ✅ NEW: Find posts by tag
    @Query("SELECT DISTINCT p FROM Post p JOIN p.tags t WHERE t IN :tags")
    Page<Post> findByTagsIn(@Param("tags") List<String> tags, Pageable pageable);

    // ✅ NEW: Admin moderation queries
    Page<Post> findByFlaggedTrueOrderByFlaggedAtDesc(Pageable pageable);

    long countByFlaggedTrue();
}