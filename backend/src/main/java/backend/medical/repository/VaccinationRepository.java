package backend.medical.repository;

import backend.medical.model.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRepository
        extends JpaRepository<Vaccination, Long> {

    // ═══════════════════════════════════════════════════════════
    // EXISTING QUERIES — kept exactly as they were
    // ═══════════════════════════════════════════════════════════

    /**
     * All vaccinations for a pet, ordered by next due date.
     * Used in: Vaccinations page, Health Passport
     */
    List<Vaccination> findByPetIdOrderByNextDueDateAsc(Long petId);

    /**
     * Overdue vaccinations for a specific pet.
     * Used in: Health dashboard warnings
     */
    @Query("""
        SELECT v FROM Vaccination v
        WHERE v.pet.id = :petId
        AND v.nextDueDate <= :date
        """)
    List<Vaccination> findOverdueVaccinations(
            @Param("petId") Long      petId,
            @Param("date")  LocalDate date
    );

    /**
     * Upcoming vaccinations for a specific pet within a date range.
     * Used in: Health dashboard, vaccination reminders
     */
    @Query("""
        SELECT v FROM Vaccination v
        WHERE v.pet.id = :petId
        AND v.nextDueDate BETWEEN :startDate AND :endDate
        """)
    List<Vaccination> findUpcomingVaccinations(
            @Param("petId")     Long      petId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate
    );

    // ═══════════════════════════════════════════════════════════
    // NEW QUERIES — required by NotificationService scheduler
    // ═══════════════════════════════════════════════════════════

    /**
     * ALL overdue vaccinations across ALL pets & owners.
     *
     * JOIN FETCH loads pet + owner eagerly so the scheduler
     * can access v.getPet().getOwner() without triggering
     * a LazyInitializationException outside the transaction.
     *
     * Used in: NotificationService.runVaccinationReminderJob()
     *          → sends VACCINATION_OVERDUE notification + email
     *          → runs every day at 8:00 AM
     */
    @Query("""
        SELECT v FROM Vaccination v
        JOIN FETCH v.pet p
        JOIN FETCH p.owner
        WHERE v.nextDueDate < :today
        """)
    List<Vaccination> findOverdue(
            @Param("today") LocalDate today
    );

    /**
     * ALL vaccinations due within a date window across ALL pets.
     *
     * JOIN FETCH loads pet + owner eagerly (same reason above).
     *
     * Used in: NotificationService.runVaccinationReminderJob()
     *          → sends VACCINATION_DUE notification + email
     *          → default window = today to today + 7 days
     */
    @Query("""
        SELECT v FROM Vaccination v
        JOIN FETCH v.pet p
        JOIN FETCH p.owner
        WHERE v.nextDueDate BETWEEN :start AND :end
        """)
    List<Vaccination> findDueBetween(
            @Param("start") LocalDate start,
            @Param("end")   LocalDate end
    );

    /**
     * Upcoming vaccinations for a specific pet within next N days.
     *
     * Used in: Health dashboard "upcoming vaccinations" widget
     *          MedicalService.getHealthSummary()
     */
    @Query("""
        SELECT v FROM Vaccination v
        WHERE v.pet.id = :petId
        AND v.nextDueDate BETWEEN :today AND :future
        ORDER BY v.nextDueDate ASC
        """)
    List<Vaccination> findUpcomingByPetId(
            @Param("petId")  Long      petId,
            @Param("today")  LocalDate today,
            @Param("future") LocalDate future
    );

    /**
     * Count overdue vaccinations for a specific pet.
     * Used in: Health summary / dashboard badge count
     */
    @Query("""
        SELECT COUNT(v) FROM Vaccination v
        WHERE v.pet.id = :petId
        AND v.nextDueDate < :today
        """)
    long countOverdueByPetId(
            @Param("petId") Long      petId,
            @Param("today") LocalDate today
    );

    /**
     * Count upcoming vaccinations for a specific pet (next 30 days).
     * Used in: Health summary / dashboard badge count
     */
    @Query("""
        SELECT COUNT(v) FROM Vaccination v
        WHERE v.pet.id = :petId
        AND v.nextDueDate BETWEEN :today AND :future
        """)
    long countUpcomingByPetId(
            @Param("petId")  Long      petId,
            @Param("today")  LocalDate today,
            @Param("future") LocalDate future
    );
}