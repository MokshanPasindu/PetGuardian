package backend.community.controller;

import backend.common.dto.ApiResponse;
import backend.common.dto.PagedResponse;
import backend.community.dto.*;
import backend.community.model.PostCategory;
import backend.community.service.CommunityService;
import backend.user.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Community", description = "Community posts and comments APIs")
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/posts")
    @Operation(summary = "Get all posts with pagination")
    public ResponseEntity<?> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) PostCategory category,
            @RequestParam(defaultValue = "recent") String sort,
            @AuthenticationPrincipal User user) {

        log.info("Getting posts - page: {}, size: {}, category: {}, sort: {}", page, size, category, sort);

        try {
            PagedResponse<PostDTO> posts = communityService.getPosts(page, size, category, sort, user);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            log.error("Error getting posts", e);
            return ResponseEntity.ok(communityService.getPosts(page, size, category, sort, user));
        }
    }

    // ✅ NEW: Get posts by tags
    @GetMapping("/posts/by-tags")
    @Operation(summary = "Get posts by tags")
    public ResponseEntity<PagedResponse<PostDTO>> getPostsByTags(
            @RequestParam List<String> tags,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        log.info("Getting posts by tags: {}", tags);
        return ResponseEntity.ok(communityService.getPostsByTags(tags, page, size, user));
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "Get post by ID")
    public ResponseEntity<PostDTO> getPostById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        log.info("Getting post by id: {}", id);
        return ResponseEntity.ok(communityService.getPostById(id, user));
    }

    @GetMapping("/posts/search")
    @Operation(summary = "Search posts")
    public ResponseEntity<PagedResponse<PostDTO>> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        log.info("Searching posts with query: {}", query);
        return ResponseEntity.ok(communityService.searchPosts(query, page, size, user));
    }

    @PostMapping("/posts")
    @Operation(summary = "Create a new post")
    public ResponseEntity<PostDTO> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "tags", required = false) Set<String> tags, // ✅ NEW
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal User user) {

        log.info("Creating post: {}", title);

        CreatePostRequest request = new CreatePostRequest();
        request.setTitle(title);
        request.setContent(content);
        request.setCategory(PostCategory.valueOf(category.toUpperCase()));
        request.setTags(tags); // ✅ NEW

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(communityService.createPost(request, image, user));
    }

    @PutMapping("/posts/{id}")
    @Operation(summary = "Update a post")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "tags", required = false) Set<String> tags, // ✅ NEW
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal User user) {

        log.info("Updating post: {}", id);

        CreatePostRequest request = new CreatePostRequest();
        request.setTitle(title);
        request.setContent(content);
        request.setCategory(PostCategory.valueOf(category.toUpperCase()));
        request.setTags(tags); // ✅ NEW

        return ResponseEntity.ok(communityService.updatePost(id, request, image, user));
    }

    @DeleteMapping("/posts/{id}")
    @Operation(summary = "Delete a post")
    public ResponseEntity<ApiResponse> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        log.info("Deleting post: {}", id);
        communityService.deletePost(id, user);
        return ResponseEntity.ok(new ApiResponse(true, "Post deleted successfully"));
    }

    @PostMapping("/posts/{id}/like")
    @Operation(summary = "Like or unlike a post")
    public ResponseEntity<PostDTO> likePost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        log.info("Toggling like for post: {}", id);
        return ResponseEntity.ok(communityService.likePost(id, user));
    }

    // ✅ NEW: Flag post
    @PostMapping("/posts/{id}/flag")
    @Operation(summary = "Flag a post for moderation")
    public ResponseEntity<PostDTO> flagPost(
            @PathVariable Long id,
            @Valid @RequestBody FlagPostRequest request,
            @AuthenticationPrincipal User user) {
        log.info("Flagging post: {}", id);
        return ResponseEntity.ok(communityService.flagPost(id, request, user));
    }

    // Comments
    @GetMapping("/posts/{postId}/comments")
    @Operation(summary = "Get comments for a post")
    public ResponseEntity<List<CommentDTO>> getComments(
            @PathVariable Long postId,
            @AuthenticationPrincipal User user) {
        log.info("Getting comments for post: {}", postId);
        return ResponseEntity.ok(communityService.getComments(postId, user));
    }

    @PostMapping("/posts/{postId}/comments")
    @Operation(summary = "Add a comment to a post")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal User user) {
        log.info("Adding comment to post: {}", postId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(communityService.addComment(postId, request, user));
    }

    // ✅ NEW: Add reply to comment
    @PostMapping("/posts/{postId}/comments/{commentId}/replies")
    @Operation(summary = "Add a reply to a comment")
    public ResponseEntity<CommentDTO> addReply(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal User user) {
        log.info("Adding reply to comment {} on post {}", commentId, postId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(communityService.addReply(postId, commentId, request, user));
    }

    // ✅ NEW: Update comment
    @PutMapping("/posts/{postId}/comments/{commentId}")
    @Operation(summary = "Update a comment")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal User user) {
        log.info("Updating comment {} on post {}", commentId, postId);
        return ResponseEntity.ok(communityService.updateComment(postId, commentId, request, user));
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<ApiResponse> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        log.info("Deleting comment: {} from post: {}", commentId, postId);
        communityService.deleteComment(postId, commentId, user);
        return ResponseEntity.ok(new ApiResponse(true, "Comment deleted successfully"));
    }

    @PostMapping("/posts/{postId}/comments/{commentId}/like")
    @Operation(summary = "Like or unlike a comment")
    public ResponseEntity<CommentDTO> likeComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        log.info("Toggling like for comment: {} on post: {}", commentId, postId);
        return ResponseEntity.ok(communityService.likeComment(postId, commentId, user));
    }

    // ✅ NEW: Admin Moderation Endpoints
    @GetMapping("/admin/flagged-posts")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get flagged posts (Admin only)")
    public ResponseEntity<PagedResponse<PostDTO>> getFlaggedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User admin) {
        log.info("Admin {} fetching flagged posts", admin.getEmail());
        return ResponseEntity.ok(communityService.getFlaggedPosts(page, size, admin));
    }

    @PutMapping("/admin/posts/{id}/unflag")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unflag a post (Admin only)")
    public ResponseEntity<ApiResponse> unflagPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin) {
        log.info("Admin {} unflagging post {}", admin.getEmail(), id);
        communityService.unflagPost(id, admin);
        return ResponseEntity.ok(new ApiResponse(true, "Post unflagged successfully"));
    }

    @DeleteMapping("/admin/posts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a post (Admin only)")
    public ResponseEntity<ApiResponse> deletePostByAdmin(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin) {
        log.info("Admin {} deleting post {}", admin.getEmail(), id);
        communityService.deletePostByAdmin(id, admin);
        return ResponseEntity.ok(new ApiResponse(true, "Post deleted by admin successfully"));
    }
}