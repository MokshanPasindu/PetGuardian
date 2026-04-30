package backend.notification.controller;

import backend.notification.dto.NotificationDTO;
import backend.notification.service.NotificationService;
import backend.user.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management APIs")
public class NotificationController {

    private final NotificationService notificationService;

    // GET /notifications
    @GetMapping
    @Operation(summary = "Get all notifications for current user")
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                notificationService.getUserNotifications(user)
        );
    }

    // GET /notifications/unread
    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<List<NotificationDTO>> getUnread(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(user)
        );
    }

    // GET /notifications/count
    @GetMapping("/count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(Map.of(
                "count", notificationService.getUnreadCount(user)
        ));
    }

    // PATCH /notifications/{id}/read
    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    // PATCH /notifications/read-all
    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal User user
    ) {
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    // DELETE /notifications/{id}
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        notificationService.deleteNotification(id, user);
        return ResponseEntity.ok().build();
    }

    // DELETE /notifications/clear-read
    @DeleteMapping("/clear-read")
    @Operation(summary = "Delete all read notifications")
    public ResponseEntity<Void> clearRead(
            @AuthenticationPrincipal User user
    ) {
        notificationService.clearReadNotifications(user);
        return ResponseEntity.ok().build();
    }
}