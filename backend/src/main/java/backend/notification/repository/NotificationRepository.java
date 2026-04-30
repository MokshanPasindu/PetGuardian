package backend.notification.repository;

import backend.notification.model.Notification;
import backend.notification.model.NotificationType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // ── Fetch ──────────────────────────────────────────────────
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdOrderByCreatedAtDesc(
            Long userId, Pageable pageable
    );

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(
            Long userId
    );

    // ── Count ─────────────────────────────────────────────────
    long countByUserIdAndReadFalse(Long userId);

    // ── Mark read ─────────────────────────────────────────────
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :id AND n.user.id = :userId")
    void markAsRead(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId")
    void markAllAsRead(@Param("userId") Long userId);

    // ── Delete ────────────────────────────────────────────────
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.id = :id AND n.user.id = :userId")
    void deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId AND n.read = true")
    void deleteAllReadByUserId(@Param("userId") Long userId);

    // ── Check duplicate ───────────────────────────────────────
    boolean existsByUserIdAndTypeAndReferenceIdAndReadFalse(
            Long userId, NotificationType type, Long referenceId
    );
}