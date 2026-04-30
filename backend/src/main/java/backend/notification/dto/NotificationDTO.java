package backend.notification.dto;

import backend.notification.model.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDTO {
    private Long            id;
    private NotificationType type;
    private String          title;
    private String          message;
    private String          actionUrl;
    private Long            referenceId;
    private boolean         read;
    private LocalDateTime   createdAt;
}