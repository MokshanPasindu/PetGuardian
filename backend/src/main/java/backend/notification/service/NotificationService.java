package backend.notification.service;

import backend.medical.model.Vaccination;
import backend.medical.repository.VaccinationRepository;
import backend.notification.dto.NotificationDTO;
import backend.notification.model.Notification;
import backend.notification.model.NotificationType;
import backend.notification.repository.NotificationRepository;
import backend.user.model.User;
import backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;
    private final VaccinationRepository  vaccinationRepository;
    private final EmailService           emailService;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMMM d, yyyy");

    // ═══════════════════════════════════════════════════════════
    // CORRECT ROUTES — matching App.jsx exactly
    // ═══════════════════════════════════════════════════════════
    //
    //  /scan/history           ← AI scan history
    //  /appointments           ← Owner appointments
    //  /vets                   ← Find vet (Vet Connect)
    //  /health/:petId/vaccinations ← Vaccinations
    //  /community/post/:id     ← Post details
    //  /pets/:id               ← Pet details
    //  /dashboard              ← Owner dashboard
    //
    // ═══════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════
    // FETCH
    // ═══════════════════════════════════════════════════════════

    public List<NotificationDTO> getUserNotifications(User user) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId(), PageRequest.of(0, 50))
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(User user) {
        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                        user.getId())
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
        log.info("All notifications marked read | user={}",
                user.getId());
    }

    @Transactional
    public void deleteNotification(Long id, User user) {
        notificationRepository.deleteByIdAndUserId(
                id, user.getId());
    }

    @Transactional
    public void clearReadNotifications(User user) {
        notificationRepository.deleteAllReadByUserId(
                user.getId());
    }

    // ═══════════════════════════════════════════════════════════
    // CORE CREATE
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void createNotification(
            User             user,
            NotificationType type,
            String           title,
            String           message,
            String           actionUrl,
            Long             referenceId
    ) {
        // ── Duplicate guard ────────────────────────────────────
        if (referenceId != null &&
                notificationRepository
                        .existsByUserIdAndTypeAndReferenceIdAndReadFalse(
                                user.getId(), type, referenceId)) {
            log.debug("Duplicate skipped | type={} ref={}",
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
        log.info("Notification created | user={} type={} | {}",
                user.getId(), type, title);
    }

    // ── Convenience overloads ──────────────────────────────────

    @Transactional
    public void createNotification(
            User user, NotificationType type,
            String title, String message
    ) {
        createNotification(
                user, type, title, message, null, null);
    }

    @Transactional
    public void createNotification(
            User user, NotificationType type,
            String title, String message, String actionUrl
    ) {
        createNotification(
                user, type, title, message, actionUrl, null);
    }

    // ═══════════════════════════════════════════════════════════
    // WELCOME
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void sendWelcomeNotification(User user) {
        createNotification(
                user,
                NotificationType.WELCOME,
                "Welcome to PetGuardian! 🐾",
                "Start by adding your first pet and keep " +
                        "their health records in one place.",
                "/pets/add"   // ✅ matches App.jsx
        );

        try {
            emailService.sendWelcomeEmail(
                    user.getEmail(),
                    user.getFirstName()
            );
        } catch (Exception e) {
            log.warn("Welcome email failed: {}", e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════
    // AI SCAN NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void sendAIScanNotification(
            User    user,
            Long    scanId,
            String  predictedClass,
            String  severity,
            boolean vetConnectTriggered
    ) {
        sendAIScanNotification(
                user, scanId, predictedClass,
                severity, vetConnectTriggered, "your pet"
        );
    }

    @Transactional
    public void sendAIScanNotification(
            User    user,
            Long    scanId,
            String  predictedClass,
            String  severity,
            boolean vetConnectTriggered,
            String  petName
    ) {
        if ("SEVERE".equalsIgnoreCase(severity)) {
            createNotification(
                    user,
                    NotificationType.AI_SCAN_SEVERE,
                    "⚠️ Severe Condition Detected",
                    "AI detected '" + predictedClass +
                            "' in " + petName +
                            " — immediate vet care recommended.",
                    "/scan/history",   // ✅ matches App.jsx
                    scanId
            );

            try {
                emailService.sendSevereAlertEmail(
                        user.getEmail(),
                        user.getFullName(),
                        petName,
                        predictedClass
                );
            } catch (Exception e) {
                log.warn("Severe alert email failed: {}",
                        e.getMessage());
            }

        } else {
            createNotification(
                    user,
                    NotificationType.AI_SCAN_COMPLETE,
                    "AI Scan Complete ✅",
                    petName + "'s scan result: " +
                            predictedClass + " (" +
                            severity.toLowerCase() + " severity).",
                    "/scan/history",   // ✅ matches App.jsx
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
                "Appointment Booked 📅",
                "Appointment for " + petName +
                        " at " + clinicName +
                        " on " + date + " has been booked.",
                "/appointments",   // ✅ matches App.jsx
                appointmentId
        );

        try {
            emailService.sendAppointmentBookedEmail(
                    user.getEmail(),
                    user.getFullName(),
                    petName,
                    clinicName,
                    date,
                    null,
                    null
            );
        } catch (Exception e) {
            log.warn("Appointment booked email failed: {}",
                    e.getMessage());
        }
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
                        " at " + clinicName +
                        " has been confirmed.",
                "/appointments",   // ✅ matches App.jsx
                appointmentId
        );

        try {
            emailService.sendAppointmentConfirmedEmail(
                    user.getEmail(),
                    user.getFullName(),
                    petName,
                    clinicName,
                    "Confirmed",
                    null
            );
        } catch (Exception e) {
            log.warn("Appointment confirmed email failed: {}",
                    e.getMessage());
        }
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
                "Appointment Cancelled ❌",
                "Your appointment for " + petName +
                        " has been cancelled.",
                "/appointments",   // ✅ matches App.jsx
                appointmentId
        );

        try {
            emailService.sendAppointmentCancelledEmail(
                    user.getEmail(),
                    user.getFullName(),
                    petName,
                    "your clinic"
            );
        } catch (Exception e) {
            log.warn("Appointment cancelled email failed: {}",
                    e.getMessage());
        }
    }

    @Transactional
    public void sendAppointmentReminderNotification(
            User   user,
            Long   appointmentId,
            String petName,
            String clinicName,
            String date
    ) {
        createNotification(
                user,
                NotificationType.APPOINTMENT_REMINDER,
                "Appointment Tomorrow 🔔",
                petName + "'s appointment at " +
                        clinicName + " is tomorrow, " +
                        date + ".",
                "/appointments",   // ✅ matches App.jsx
                appointmentId
        );

        try {
            emailService.sendAppointmentReminderEmail(
                    user.getEmail(),
                    user.getFullName(),
                    petName,
                    clinicName,
                    date,
                    null
            );
        } catch (Exception e) {
            log.warn("Appointment reminder email failed: {}",
                    e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════
    // VACCINATION NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void sendVaccinationDueNotification(
            User   user,
            Long   vaccinationId,
            String petName,
            String vaccineName,
            String dueDate
    ) {
        // ── Get petId for correct URL ──────────────────────────
        // actionUrl = /health/:petId/vaccinations
        // We use referenceId (vaccinationId) to build URL
        // Frontend navigates to vaccination page for that pet
        createNotification(
                user,
                NotificationType.VACCINATION_DUE,
                "Vaccination Due 💉",
                petName + "'s " + vaccineName +
                        " vaccination is due on " + dueDate + ".",
                "/pets",   // ✅ go to pets list, user selects pet
                vaccinationId
        );

        try {
            emailService.sendVaccinationReminderEmail(
                    user.getEmail(),
                    user.getFullName(),
                    petName,
                    vaccineName,
                    dueDate,
                    false
            );
        } catch (Exception e) {
            log.warn("Vaccination due email failed: {}",
                    e.getMessage());
        }
    }

    @Transactional
    public void sendVaccinationDueNotification(
            User   user,
            Long   vaccinationId,
            Long   petId,
            String petName,
            String vaccineName,
            String dueDate
    ) {
        // ✅ PREFERRED overload — includes petId for exact URL
        createNotification(
                user,
                NotificationType.VACCINATION_DUE,
                "Vaccination Due 💉",
                petName + "'s " + vaccineName +
                        " vaccination is due on " + dueDate + ".",
                "/health/" + petId + "/vaccinations",  // ✅ exact URL
                vaccinationId
        );

        try {
            emailService.sendVaccinationReminderEmail(
                    user.getEmail(),
                    user.getFullName(),
                    petName,
                    vaccineName,
                    dueDate,
                    false
            );
        } catch (Exception e) {
            log.warn("Vaccination due email failed: {}",
                    e.getMessage());
        }
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
                        " vaccination is overdue — " +
                        "please schedule immediately.",
                "/pets",   // ✅ go to pets list
                vaccinationId
        );

        try {
            emailService.sendVaccinationReminderEmail(
                    user.getEmail(),
                    user.getFullName(),
                    petName,
                    vaccineName,
                    "Overdue",
                    true
            );
        } catch (Exception e) {
            log.warn("Vaccination overdue email failed: {}",
                    e.getMessage());
        }
    }

    @Transactional
    public void sendVaccinationOverdueNotification(
            User   user,
            Long   vaccinationId,
            Long   petId,
            String petName,
            String vaccineName
    ) {
        // ✅ PREFERRED overload — includes petId for exact URL
        createNotification(
                user,
                NotificationType.VACCINATION_OVERDUE,
                "⚠️ Vaccination Overdue",
                petName + "'s " + vaccineName +
                        " vaccination is overdue — " +
                        "please schedule immediately.",
                "/health/" + petId + "/vaccinations",  // ✅ exact URL
                vaccinationId
        );

        try {
            emailService.sendVaccinationReminderEmail(
                    user.getEmail(),
                    user.getFullName(),
                    petName,
                    vaccineName,
                    "Overdue",
                    true
            );
        } catch (Exception e) {
            log.warn("Vaccination overdue email failed: {}",
                    e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════
    // COMMUNITY NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void sendCommunityReplyNotification(
            User   user,
            Long   postId,
            String replierName,
            String postTitle
    ) {
        createNotification(
                user,
                NotificationType.COMMUNITY_REPLY,
                "New Reply on Your Post 💬",
                replierName + " replied to: \"" +
                        postTitle + "\"",
                "/community/post/" + postId,  // ✅ matches App.jsx
                postId
        );
    }

    // ═══════════════════════════════════════════════════════════
    // SCHEDULER — Vaccination Reminders (8AM daily)
    // ═══════════════════════════════════════════════════════════

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void runVaccinationReminderJob() {
        log.info("═══ Vaccination reminder job START ═══");

        LocalDate today   = LocalDate.now();
        LocalDate in7Days = today.plusDays(7);

        // ── Overdue ───────────────────────────────────────────
        try {
            List<Vaccination> overdue =
                    vaccinationRepository.findOverdue(today);

            log.info("Overdue vaccinations found: {}",
                    overdue.size());

            for (Vaccination v : overdue) {
                try {
                    // ✅ Use overload with petId for exact URL
                    sendVaccinationOverdueNotification(
                            v.getPet().getOwner(),
                            v.getId(),
                            v.getPet().getId(),      // ← petId
                            v.getPet().getName(),
                            v.getName()
                    );
                } catch (Exception e) {
                    log.warn("Overdue reminder failed | v={} | {}",
                            v.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Overdue check failed: {}", e.getMessage());
        }

        // ── Due within 7 days ──────────────────────────────────
        try {
            List<Vaccination> dueSoon =
                    vaccinationRepository.findDueBetween(
                            today, in7Days);

            log.info("Vaccinations due in 7 days: {}",
                    dueSoon.size());

            for (Vaccination v : dueSoon) {
                try {
                    // ✅ Use overload with petId for exact URL
                    sendVaccinationDueNotification(
                            v.getPet().getOwner(),
                            v.getId(),
                            v.getPet().getId(),      // ← petId
                            v.getPet().getName(),
                            v.getName(),
                            v.getNextDueDate().format(DATE_FMT)
                    );
                } catch (Exception e) {
                    log.warn("Due-soon reminder failed | v={} | {}",
                            v.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Due-soon check failed: {}",
                    e.getMessage());
        }

        log.info("═══ Vaccination reminder job END ═══");
    }

    // ═══════════════════════════════════════════════════════════
    // MAPPING
    // ═══════════════════════════════════════════════════════════

    public NotificationDTO toDTO(Notification n) {
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