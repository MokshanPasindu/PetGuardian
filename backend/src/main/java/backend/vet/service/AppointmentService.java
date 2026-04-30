package backend.vet.service;

import backend.common.exception.BadRequestException;
import backend.common.exception.ResourceNotFoundException;
import backend.notification.service.NotificationService;
import backend.pet.model.Pet;
import backend.pet.repository.PetRepository;
import backend.user.model.Role;
import backend.user.model.User;
import backend.vet.dto.AppointmentDTO;
import backend.vet.dto.CreateAppointmentRequest;
import backend.vet.dto.VetDashboardDTO;
import backend.vet.model.Appointment;
import backend.vet.model.AppointmentStatus;
import backend.vet.model.VetClinic;
import backend.vet.repository.AppointmentRepository;
import backend.vet.repository.VetClinicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository         petRepository;
    private final VetClinicRepository   vetClinicRepository;
    private final NotificationService notificationService;
    // ═══════════════════════════════════════════════════════════
    // OWNER METHODS
    // ═══════════════════════════════════════════════════════════

    public List<AppointmentDTO> getUserAppointments(User user) {
        return appointmentRepository
                .findByUserIdOrderByDateDescTimeDesc(user.getId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getPendingAppointments(User user) {
        return appointmentRepository
                .findByUserIdAndStatusOrderByDateAscTimeAsc(
                        user.getId(), AppointmentStatus.PENDING)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id, User user) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        // Owner or VET can view
        boolean isOwner = a.getUser().getId().equals(user.getId());
        boolean isVet   = user.getRole() == Role.VET;
        if (!isOwner && !isVet) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        return mapToDTO(a);
    }

    @Transactional
    public AppointmentDTO createAppointment(
            CreateAppointmentRequest request, User user
    ) {
        Pet pet = petRepository
                .findByIdAndOwnerId(request.getPetId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        VetClinic clinic = vetClinicRepository
                .findById(request.getClinicId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vet clinic not found"));

        Appointment a = Appointment.builder()
                .date(request.getDate())
                .time(request.getTime())
                .reason(request.getReason())
                .notes(request.getNotes())
                .status(AppointmentStatus.PENDING)
                .pet(pet)
                .user(user)
                .clinic(clinic)
                .build();

        Appointment saved = appointmentRepository.save(a);

        // Send notification to pet owner
        notificationService.sendAppointmentBookedNotification(
                user,
                saved.getId(),
                pet.getName(),
                clinic.getName(),
                request.getDate().toString()
        );

        return mapToDTO(saved);
    }

    @Transactional
    public AppointmentDTO updateAppointmentStatus(
            Long id, AppointmentStatus status, User user
    ) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        if (!a.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Appointment not found");
        }

        a.setStatus(status);
        return mapToDTO(appointmentRepository.save(a));
    }

    @Transactional
    public void cancelAppointment(Long id, User user) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        if (!a.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        if (a.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException(
                    "Cannot cancel a completed appointment");
        }

        a.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(a);

        // Send cancellation notification to pet owner
        notificationService.sendAppointmentCancelledNotification(
                a.getUser(),
                a.getId(),
                a.getPet().getName()
        );
    }

    // ═══════════════════════════════════════════════════════════
    // VET METHODS
    // ═══════════════════════════════════════════════════════════

    public List<AppointmentDTO> getVetAppointments(User vet) {
        List<VetClinic> clinics = vetClinicRepository.findAll();
        // For now return all appointments —
        // in production link VET user to specific clinic
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getTodayAppointments(User vet) {
        List<VetClinic> clinics = vetClinicRepository.findAll();
        if (clinics.isEmpty()) return Collections.emptyList();

        // Get first clinic (in production link vet to clinic)
        Long clinicId = clinics.get(0).getId();
        return appointmentRepository
                .findTodayByClinicId(clinicId, LocalDate.now())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getVetPendingAppointments(User vet) {
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getVetAppointmentsByDate(
            LocalDate date, User vet
    ) {
        List<VetClinic> clinics = vetClinicRepository.findAll();
        if (clinics.isEmpty()) return Collections.emptyList();

        Long clinicId = clinics.get(0).getId();
        return appointmentRepository
                .findByClinicIdAndDateOrderByTimeAsc(clinicId, date)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDTO vetUpdateStatus(
            Long id, AppointmentStatus status, User vet
    ) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));

        if (a.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cannot update a cancelled appointment");
        }

        a.setStatus(status);
        log.info("Vet {} updated appointment {} to {}",
                vet.getId(), id, status);

        Appointment saved = appointmentRepository.save(a);

        // Send notification when status is CONFIRMED
        if (status == AppointmentStatus.CONFIRMED) {
            notificationService.sendAppointmentConfirmedNotification(
                    a.getUser(),
                    a.getId(),
                    a.getPet().getName(),
                    a.getClinic().getName()
            );
        }

        // Send notification when status is CANCELLED
        if (status == AppointmentStatus.CANCELLED) {
            notificationService.sendAppointmentCancelledNotification(
                    a.getUser(),
                    a.getId(),
                    a.getPet().getName()
            );
        }

        return mapToDTO(saved);
    }

    @Transactional
    public AppointmentDTO addVetNotes(Long id, String notes, User vet) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found"));
        a.setNotes(notes);
        return mapToDTO(appointmentRepository.save(a));
    }

    public VetDashboardDTO getVetDashboard(User vet) {
        List<Appointment> all = appointmentRepository.findAll();

        long todayCount     = all.stream()
                .filter(a -> a.getDate().equals(LocalDate.now()))
                .count();
        long pendingCount   = all.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                .count();
        long confirmedCount = all.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED)
                .count();
        long completedWeek  = all.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED
                        && a.getDate().isAfter(
                        LocalDate.now().minusDays(7)))
                .count();

        List<AppointmentDTO> todaySchedule = all.stream()
                .filter(a -> a.getDate().equals(LocalDate.now()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        List<AppointmentDTO> pendingRequests = all.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        List<AppointmentDTO> upcoming = all.stream()
                .filter(a -> a.getDate().isAfter(LocalDate.now())
                        && a.getStatus() == AppointmentStatus.CONFIRMED)
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return VetDashboardDTO.builder()
                .todayAppointments(todayCount)
                .pendingAppointments(pendingCount)
                .confirmedAppointments(confirmedCount)
                .completedThisWeek(completedWeek)
                .totalPatients(all.stream()
                        .map(a -> a.getPet().getId())
                        .distinct().count())
                .totalAppointments((long) all.size())
                .todaySchedule(todaySchedule)
                .pendingRequests(pendingRequests)
                .upcomingAppointments(upcoming)
                .vetName(vet.getFullName())
                .clinicName("PetGuardian Veterinary Clinic")
                .build();
    }

    // ═══════════════════════════════════════════════════════════
    // MAPPING
    // ═══════════════════════════════════════════════════════════

    private AppointmentDTO mapToDTO(Appointment a) {
        return AppointmentDTO.builder()
                .id(a.getId())
                .date(a.getDate())
                .time(a.getTime())
                .reason(a.getReason())
                .notes(a.getNotes())
                .status(a.getStatus())
                .petId(a.getPet().getId())
                .petName(a.getPet().getName())
                .petImage(a.getPet().getImage())
                .clinicId(a.getClinic().getId())
                .clinicName(a.getClinic().getName())
                .clinicAddress(a.getClinic().getAddress())
                .createdAt(a.getCreatedAt())
                .build();
    }
}