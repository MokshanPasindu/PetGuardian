package backend.notification.service;

import backend.notification.dto.NotificationDTO;
import backend.notification.model.Notification;
import backend.notification.model.NotificationType;
import backend.notification.repository.NotificationRepository;
import backend.user.model.User;
import backend.user.repository.UserRepository;
import backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;

    // ═══════════════════════════════════════════════════════════
    // FETCH
    // ═══════════════════════════════════════════════════════════

    public List<NotificationDTO> getUserNotifications(User user) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId(),
                        PageRequest.of(0, 50)
                )
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(User user) {
        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(User user) {
        return notificationRepository
                .countByUserIdAndReadFalse(user.getId());
    }

    // ═══════════════════════════════════════════════════════════
    // MARK READ / DELETE
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void markAsRead(Long id, User user) {
        notificationRepository.markAsRead(id, user.getId());
    }

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsRead(user.getId());
        log.info("Marked all notifications read for user {}", user.getId());
    }

    @Transactional
    public void deleteNotification(Long id, User user) {
        notificationRepository.deleteByIdAndUserId(id, user.getId());
    }

    @Transactional
    public void clearReadNotifications(User user) {
        notificationRepository.deleteAllReadByUserId(user.getId());
    }

    // ═══════════════════════════════════════════════════════════
    // CREATE — called from other services
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void createNotification(
            User            user,
            NotificationType type,
            String          title,
            String          message,
            String          actionUrl,
            Long            referenceId
    ) {
        // Avoid duplicate unread notifications
        if (referenceId != null &&
                notificationRepository
                        .existsByUserIdAndTypeAndReferenceIdAndReadFalse(
                                user.getId(), type, referenceId)) {
            log.debug("Skipping duplicate notification type={} ref={}",
                    type, referenceId);
            return;
        }

        Notification n = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .referenceId(referenceId)
                .read(false)
                .build();

        notificationRepository.save(n);
        log.info("Notification created | user={} type={} title='{}'",
                user.getId(), type, title);
    }

    // ── Convenience overloads ──────────────────────────────────
    @Transactional
    public void createNotification(
            User user, NotificationType type,
            String title, String message
    ) {
        createNotification(user, type, title, message, null, null);
    }

    @Transactional
    public void createNotification(
            User user, NotificationType type,
            String title, String message, String actionUrl
    ) {
        createNotification(user, type, title, message, actionUrl, null);
    }

    // ═══════════════════════════════════════════════════════════
    // WELCOME NOTIFICATION
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void sendWelcomeNotification(User user) {
        createNotification(
                user,
                NotificationType.WELCOME,
                "Welcome to PetGuardian! 🐾",
                "Start by adding your first pet profile and " +
                        "keep their health records in one place.",
                "/pets/add"
        );
    }

    // ═══════════════════════════════════════════════════════════
    // AI SCAN NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void sendAIScanNotification(
            User   user,
            Long   scanId,
            String predictedClass,
            String severity,
            boolean vetConnectTriggered
    ) {
        if ("SEVERE".equalsIgnoreCase(severity)) {
            createNotification(
                    user,
                    NotificationType.AI_SCAN_SEVERE,
                    "⚠️ Severe Condition Detected",
                    "AI detected '" + predictedClass +
                            "' — immediate veterinary care is recommended.",
                    "/scan/history",
                    scanId
            );
        } else {
            createNotification(
                    user,
                    NotificationType.AI_SCAN_COMPLETE,
                    "AI Scan Complete",
                    "Analysis result: " + predictedClass +
                            " (" + severity.toLowerCase() + " severity).",
                    "/scan/history",
                    scanId
            );
        }
    }

    // ═══════════════════════════════════════════════════════════
    // APPOINTMENT NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void sendAppointmentBookedNotification(
            User   user,
            Long   appointmentId,
            String petName,
            String clinicName,
            String date
    ) {
        createNotification(
                user,
                NotificationType.APPOINTMENT_BOOKED,
                "Appointment Booked",
                "Appointment for " + petName +
                        " at " + clinicName +
                        " on " + date + " is confirmed.",
                "/appointments",
                appointmentId
        );
    }

    @Transactional
    public void sendAppointmentConfirmedNotification(
            User   user,
            Long   appointmentId,
            String petName,
            String clinicName
    ) {
        createNotification(
                user,
                NotificationType.APPOINTMENT_CONFIRMED,
                "Appointment Confirmed ✅",
                "Your appointment for " + petName +
                        " at " + clinicName + " has been confirmed.",
                "/appointments",
                appointmentId
        );
    }

    @Transactional
    public void sendAppointmentCancelledNotification(
            User   user,
            Long   appointmentId,
            String petName
    ) {
        createNotification(
                user,
                NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled",
                "Your appointment for " + petName +
                        " has been cancelled.",
                "/appointments",
                appointmentId
        );
    }

    // ═══════════════════════════════════════════════════════════
    // VACCINATION NOTIFICATIONS (scheduled)
    // ═══════════════════════════════════════════════════════════

    @Scheduled(cron = "0 0 8 * * *") // Every day at 8:00 AM
    @Transactional
    public void sendVaccinationReminders() {
        log.info("Running vaccination reminder job...");
        try {
            checkVaccinationsDue();
        } catch (Exception e) {
            log.error("Vaccination reminder job failed: {}", e.getMessage());
        }
    }

    private void checkVaccinationsDue() {
        // Get all users
        List<User> users = userRepository.findAll();

        for (User user : users) {
            try {
                sendVaccinationReminderForUser(user);
            } catch (Exception e) {
                log.warn("Failed to send vaccination reminder for user {}: {}",
                        user.getId(), e.getMessage());
            }
        }
    }

    private void sendVaccinationReminderForUser(User user) {
        // This will be called from MedicalService when vaccinations
        // are checked — placeholder for now
        log.debug("Checking vaccinations for user {}", user.getId());
    }

    @Transactional
    public void sendVaccinationDueNotification(
            User   user,
            Long   vaccinationId,
            String petName,
            String vaccineName,
            String dueDate
    ) {
        createNotification(
                user,
                NotificationType.VACCINATION_DUE,
                "Vaccination Due 💉",
                petName + "'s " + vaccineName +
                        " vaccination is due on " + dueDate + ".",
                "/health/" + vaccinationId + "/vaccinations",
                vaccinationId
        );
    }

    @Transactional
    public void sendVaccinationOverdueNotification(
            User   user,
            Long   vaccinationId,
            String petName,
            String vaccineName
    ) {
        createNotification(
                user,
                NotificationType.VACCINATION_OVERDUE,
                "⚠️ Vaccination Overdue",
                petName + "'s " + vaccineName +
                        " vaccination is overdue. Please schedule immediately.",
                "/health/" + vaccinationId + "/vaccinations",
                vaccinationId
        );
    }

    // ═══════════════════════════════════════════════════════════
    // MAPPING
    // ═══════════════════════════════════════════════════════════

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .actionUrl(n.getActionUrl())
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}