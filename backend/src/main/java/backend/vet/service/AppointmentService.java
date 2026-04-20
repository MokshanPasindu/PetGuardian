package backend.vet.service;

import backend.common.exception.ResourceNotFoundException;
import backend.common.exception.BadRequestException;
import backend.pet.model.Pet;
import backend.pet.repository.PetRepository;
import backend.user.model.User;
import backend.vet.dto.AppointmentDTO;
import backend.vet.dto.CreateAppointmentRequest;
import backend.vet.model.Appointment;
import backend.vet.model.AppointmentStatus;
import backend.vet.model.VetClinic;
import backend.vet.repository.AppointmentRepository;
import backend.vet.repository.VetClinicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final VetClinicRepository vetClinicRepository;

    public List<AppointmentDTO> getUserAppointments(User user) {
        return appointmentRepository.findByUserIdOrderByDateDescTimeDesc(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getPendingAppointments(User user) {
        return appointmentRepository.findByUserIdAndStatusOrderByDateAscTimeAsc(
                        user.getId(), AppointmentStatus.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id, User user) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Appointment not found");
        }

        return mapToDTO(appointment);
    }

    @Transactional
    public AppointmentDTO createAppointment(CreateAppointmentRequest request, User user) {
        Pet pet = petRepository.findByIdAndOwnerId(request.getPetId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        VetClinic clinic = vetClinicRepository.findById(request.getClinicId())
                .orElseThrow(() -> new ResourceNotFoundException("Vet clinic not found"));

        Appointment appointment = Appointment.builder()
                .date(request.getDate())
                .time(request.getTime())
                .reason(request.getReason())
                .notes(request.getNotes())
                .status(AppointmentStatus.PENDING)
                .pet(pet)
                .user(user)
                .clinic(clinic)
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToDTO(savedAppointment);
    }

    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long id, AppointmentStatus status, User user) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Appointment not found");
        }

        appointment.setStatus(status);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToDTO(savedAppointment);
    }

    @Transactional
    public void cancelAppointment(Long id, User user) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Appointment not found");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    private AppointmentDTO mapToDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .date(appointment.getDate())
                .time(appointment.getTime())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .status(appointment.getStatus())
                .petId(appointment.getPet().getId())
                .petName(appointment.getPet().getName())
                .petImage(appointment.getPet().getImage())
                .clinicId(appointment.getClinic().getId())
                .clinicName(appointment.getClinic().getName())
                .clinicAddress(appointment.getClinic().getAddress())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}