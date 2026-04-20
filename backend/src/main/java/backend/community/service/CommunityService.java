package backend.community.service;

import backend.common.dto.PagedResponse;
import backend.common.exception.BadRequestException;
import backend.common.exception.ResourceNotFoundException;
import backend.community.dto.*;
import backend.community.model.Comment;
import backend.community.model.Post;
import backend.community.model.PostCategory;
import backend.community.repository.CommentRepository;
import backend.community.repository.PostRepository;
import backend.storage.StorageService;
import backend.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommunityService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final StorageService storageService;

    // Posts
    public PagedResponse<PostDTO> getPosts(int page, int size, PostCategory category, String sort, User currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts;

        if (category != null) {
            posts = postRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        } else if ("trending".equals(sort)) {
            posts = postRepository.findTrendingPosts(pageable);
        } else {
            posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<PostDTO> postDTOs = posts.getContent().stream()
                .map(post -> mapToPostDTO(post, currentUser))
                .collect(Collectors.toList());

        return new PagedResponse<>(
                postDTOs,
                posts.getNumber(),
                posts.getSize(),
                posts.getTotalElements(),
                posts.getTotalPages(),
                posts.isLast()
        );
    }

    public PostDTO getPostById(Long id, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        return mapToPostDTO(post, currentUser);
    }

    public List<PostDTO> getPostsByUser(Long userId, User currentUser) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .map(post -> mapToPostDTO(post, currentUser))
                .collect(Collectors.toList());
    }

    public PagedResponse<PostDTO> searchPosts(String query, int page, int size, User currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.searchPosts(query, pageable);

        List<PostDTO> postDTOs = posts.getContent().stream()
                .map(post -> mapToPostDTO(post, currentUser))
                .collect(Collectors.toList());

        return new PagedResponse<>(
                postDTOs,
                posts.getNumber(),
                posts.getSize(),
                posts.getTotalElements(),
                posts.getTotalPages(),
                posts.isLast()
        );
    }

    // ✅ NEW: Search posts by tags
    public PagedResponse<PostDTO> getPostsByTags(List<String> tags, int page, int size, User currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByTagsIn(tags, pageable);

        List<PostDTO> postDTOs = posts.getContent().stream()
                .map(post -> mapToPostDTO(post, currentUser))
                .collect(Collectors.toList());

        return new PagedResponse<>(
                postDTOs,
                posts.getNumber(),
                posts.getSize(),
                posts.getTotalElements(),
                posts.getTotalPages(),
                posts.isLast()
        );
    }

    @Transactional
    public PostDTO createPost(CreatePostRequest request, MultipartFile image, User author) {
        log.info("Creating post: {} by user: {}", request.getTitle(), author.getEmail());

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .tags(request.getTags() != null ? request.getTags() : Set.of()) // ✅ NEW
                .author(author)
                .build();

        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = storageService.store(image, "posts");
                post.setImageUrl(imageUrl);
                log.info("Image stored: {}", imageUrl);
            } catch (Exception e) {
                log.error("Failed to store image", e);
            }
        }

        Post savedPost = postRepository.save(post);
        log.info("Post created successfully: {}", savedPost.getId());
        return mapToPostDTO(savedPost, author);
    }

    @Transactional
    public PostDTO updatePost(Long id, CreatePostRequest request, MultipartFile image, User user) {
        log.info("Updating post: {} by user: {}", id, user.getEmail());

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own posts");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategory(request.getCategory());
        post.setTags(request.getTags() != null ? request.getTags() : Set.of()); // ✅ NEW

        if (image != null && !image.isEmpty()) {
            try {
                if (post.getImageUrl() != null) {
                    storageService.delete(post.getImageUrl());
                }
                String imageUrl = storageService.store(image, "posts");
                post.setImageUrl(imageUrl);
                log.info("Image updated: {}", imageUrl);
            } catch (Exception e) {
                log.error("Failed to update image", e);
            }
        }

        Post savedPost = postRepository.save(post);
        log.info("Post updated successfully: {}", savedPost.getId());
        return mapToPostDTO(savedPost, user);
    }

    @Transactional
    public void deletePost(Long id, User user) {
        log.info("Deleting post: {} by user: {}", id, user.getEmail());

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own posts");
        }

        if (post.getImageUrl() != null) {
            try {
                storageService.delete(post.getImageUrl());
                log.info("Image deleted: {}", post.getImageUrl());
            } catch (Exception e) {
                log.error("Failed to delete image", e);
            }
        }

        postRepository.delete(post);
        log.info("Post deleted successfully: {}", id);
    }

    @Transactional
    public PostDTO likePost(Long id, User user) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (post.getLikes().contains(user)) {
            post.getLikes().remove(user);
            log.info("User {} unliked post {}", user.getEmail(), id);
        } else {
            post.getLikes().add(user);
            log.info("User {} liked post {}", user.getEmail(), id);
        }

        Post savedPost = postRepository.save(post);
        return mapToPostDTO(savedPost, user);
    }

    // ✅ NEW: Flag post for moderation
    @Transactional
    public PostDTO flagPost(Long id, FlagPostRequest request, User user) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (post.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You cannot flag your own post");
        }

        post.setFlagged(true);
        post.setFlagReason(request.getReason());
        post.setFlaggedBy(user);
        post.setFlaggedAt(LocalDateTime.now());

        Post savedPost = postRepository.save(post);
        log.info("Post {} flagged by user {}", id, user.getEmail());
        return mapToPostDTO(savedPost, user);
    }

    // Comments
    public List<CommentDTO> getComments(Long postId, User currentUser) {
        // Get only top-level comments (no parent)
        List<Comment> comments = commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(postId);
        return comments.stream()
                .map(comment -> mapToCommentDTO(comment, currentUser, true)) // true = include replies
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO addComment(Long postId, CreateCommentRequest request, User author) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .author(author)
                .build();

        Comment savedComment = commentRepository.save(comment);
        log.info("Comment added to post {} by {}", postId, author.getEmail());
        return mapToCommentDTO(savedComment, author, false);
    }

    // ✅ NEW: Add reply to comment
    @Transactional
    public CommentDTO addReply(Long postId, Long commentId, CreateCommentRequest request, User author) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!parentComment.getPost().getId().equals(postId)) {
            throw new BadRequestException("Comment does not belong to this post");
        }

        Comment reply = Comment.builder()
                .content(request.getContent())
                .post(post)
                .author(author)
                .parentComment(parentComment)
                .build();

        Comment savedReply = commentRepository.save(reply);
        log.info("Reply added to comment {} by {}", commentId, author.getEmail());
        return mapToCommentDTO(savedReply, author, false);
    }

    // ✅ NEW: Update comment
    @Transactional
    public CommentDTO updateComment(Long postId, Long commentId, UpdateCommentRequest request, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getPost().getId().equals(postId)) {
            throw new ResourceNotFoundException("Comment not found for this post");
        }

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setEdited(true);

        Comment savedComment = commentRepository.save(comment);
        log.info("Comment {} edited by {}", commentId, user.getEmail());
        return mapToCommentDTO(savedComment, user, false);
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getPost().getId().equals(postId)) {
            throw new ResourceNotFoundException("Comment not found for this post");
        }

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted from post {} by {}", commentId, postId, user.getEmail());
    }

    @Transactional
    public CommentDTO likeComment(Long postId, Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getPost().getId().equals(postId)) {
            throw new ResourceNotFoundException("Comment not found for this post");
        }

        if (comment.getLikes().contains(user)) {
            comment.getLikes().remove(user);
        } else {
            comment.getLikes().add(user);
        }

        Comment savedComment = commentRepository.save(comment);
        return mapToCommentDTO(savedComment, user, false);
    }

    // Admin Moderation
    public PagedResponse<PostDTO> getFlaggedPosts(int page, int size, User currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByFlaggedTrueOrderByFlaggedAtDesc(pageable);

        List<PostDTO> postDTOs = posts.getContent().stream()
                .map(post -> mapToPostDTO(post, currentUser))
                .collect(Collectors.toList());

        return new PagedResponse<>(
                postDTOs,
                posts.getNumber(),
                posts.getSize(),
                posts.getTotalElements(),
                posts.getTotalPages(),
                posts.isLast()
        );
    }

    @Transactional
    public void unflagPost(Long id, User admin) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        post.setFlagged(false);
        post.setFlagReason(null);
        post.setFlaggedBy(null);
        post.setFlaggedAt(null);

        postRepository.save(post);
        log.info("Post {} unflagged by admin {}", id, admin.getEmail());
    }

    @Transactional
    public void deletePostByAdmin(Long id, User admin) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (post.getImageUrl() != null) {
            try {
                storageService.delete(post.getImageUrl());
            } catch (Exception e) {
                log.error("Failed to delete image", e);
            }
        }

        postRepository.delete(post);
        log.info("Post {} deleted by admin {}", id, admin.getEmail());
    }

    // Mapping methods
    private PostDTO mapToPostDTO(Post post, User currentUser) {
        String imageUrl = null;
        if (post.getImageUrl() != null && !post.getImageUrl().isEmpty()) {
            imageUrl = storageService.getFileUrl(post.getImageUrl());
        }

        return PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .imageUrl(imageUrl)
                .tags(post.getTags()) // ✅ NEW
                .flagged(post.isFlagged()) // ✅ NEW
                .flagReason(post.getFlagReason()) // ✅ NEW
                .author(PostDTO.AuthorDTO.builder()
                        .id(post.getAuthor().getId())
                        .name(post.getAuthor().getFullName())
                        .avatar(post.getAuthor().getAvatar())
                        .build())
                .likes(post.getLikeCount())
                .comments(post.getCommentCount())
                .likedByCurrentUser(currentUser != null && post.getLikes().contains(currentUser))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private CommentDTO mapToCommentDTO(Comment comment, User currentUser, boolean includeReplies) {
        CommentDTO dto = CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(PostDTO.AuthorDTO.builder()
                        .id(comment.getAuthor().getId())
                        .name(comment.getAuthor().getFullName())
                        .avatar(comment.getAuthor().getAvatar())
                        .build())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null) // ✅ NEW
                .replyCount(comment.getReplyCount()) // ✅ NEW
                .likes(comment.getLikeCount())
                .likedByCurrentUser(currentUser != null && comment.getLikes().contains(currentUser))
                .edited(comment.isEdited()) // ✅ NEW
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt()) // ✅ NEW
                .build();

        // ✅ NEW: Include nested replies if requested
        if (includeReplies && comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentDTO> replies = comment.getReplies().stream()
                    .map(reply -> mapToCommentDTO(reply, currentUser, false)) // Don't nest further
                    .collect(Collectors.toList());
            dto.setReplies(replies);
        }

        return dto;
    }
}