package backend.vet.repository;


import backend.vet.model.Appointment;
import backend.vet.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserIdOrderByDateDescTimeDesc(Long userId);
    List<Appointment> findByUserIdAndStatusOrderByDateAscTimeAsc(Long userId, AppointmentStatus status);
    List<Appointment> findByClinicIdAndDateOrderByTimeAsc(Long clinicId, LocalDate date);
    List<Appointment> findByPetIdOrderByDateDesc(Long petId);
}