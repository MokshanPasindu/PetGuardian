package backend.vet.repository;

import backend.vet.model.Appointment;
import backend.vet.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ── Owner queries ──────────────────────────────────────────
    List<Appointment> findByUserIdOrderByDateDescTimeDesc(Long userId);

    List<Appointment> findByUserIdAndStatusOrderByDateAscTimeAsc(
            Long userId, AppointmentStatus status
    );

    // ── Vet / Clinic queries ───────────────────────────────────
    List<Appointment> findByClinicIdOrderByDateDescTimeDesc(Long clinicId);

    List<Appointment> findByClinicIdAndStatusOrderByDateAscTimeAsc(
            Long clinicId, AppointmentStatus status
    );

    List<Appointment> findByClinicIdAndDateOrderByTimeAsc(
            Long clinicId, LocalDate date
    );

    // ── Today's appointments for a clinic ─────────────────────
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.clinic.id = :clinicId
          AND a.date = :today
        ORDER BY a.time ASC
        """)
    List<Appointment> findTodayByClinicId(
            @Param("clinicId") Long clinicId,
            @Param("today")    LocalDate today
    );

    // ── All appointments at clinics owned/managed by a vet ────
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.clinic.id IN :clinicIds
        ORDER BY a.date DESC, a.time DESC
        """)
    List<Appointment> findByClinicIds(
            @Param("clinicIds") List<Long> clinicIds
    );

    // ── Stats ──────────────────────────────────────────────────
    long countByUserId(Long userId);

    long countByClinicId(Long clinicId);

    long countByClinicIdAndStatus(Long clinicId, AppointmentStatus status);

    long countByClinicIdAndDate(Long clinicId, LocalDate date);

    // ── Recent scans linked to clinic appointments ─────────────
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.user.id = :userId
          AND a.status = :status
        ORDER BY a.date ASC, a.time ASC
        """)
    List<Appointment> findUpcomingByUserId(
            @Param("userId") Long userId,
            @Param("status") AppointmentStatus status
    );
}