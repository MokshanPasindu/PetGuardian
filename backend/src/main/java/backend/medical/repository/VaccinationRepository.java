package backend.medical.repository;


import backend.medical.model.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByPetIdOrderByNextDueDateAsc(Long petId);

    @Query("SELECT v FROM Vaccination v WHERE v.pet.id = :petId AND v.nextDueDate <= :date")
    List<Vaccination> findOverdueVaccinations(Long petId, LocalDate date);

    @Query("SELECT v FROM Vaccination v WHERE v.pet.id = :petId AND v.nextDueDate BETWEEN :startDate AND :endDate")
    List<Vaccination> findUpcomingVaccinations(Long petId, LocalDate startDate, LocalDate endDate);
}