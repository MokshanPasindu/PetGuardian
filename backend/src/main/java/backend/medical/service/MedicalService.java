package backend.medical.service;


import backend.common.exception.ResourceNotFoundException;
import backend.medical.dto.*;
import backend.medical.model.MedicalRecord;
import backend.medical.model.RecordType;
import backend.medical.model.Vaccination;
import backend.medical.repository.MedicalRecordRepository;
import backend.medical.repository.VaccinationRepository;
import backend.pet.model.Pet;
import backend.pet.repository.PetRepository;
import backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;

    // Medical Records
    public List<MedicalRecordDTO> getMedicalHistory(Long petId, User owner) {
        validatePetOwnership(petId, owner);
        return medicalRecordRepository.findByPetIdOrderByDateDesc(petId).stream()
                .map(this::mapToMedicalRecordDTO)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDTO> getMedicalHistoryByType(Long petId, RecordType type, User owner) {
        validatePetOwnership(petId, owner);
        return medicalRecordRepository.findByPetIdAndTypeOrderByDateDesc(petId, type).stream()
                .map(this::mapToMedicalRecordDTO)
                .collect(Collectors.toList());
    }

    public MedicalRecordDTO getMedicalRecordById(Long petId, Long recordId, User owner) {
        validatePetOwnership(petId, owner);
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (!record.getPet().getId().equals(petId)) {
            throw new ResourceNotFoundException("Medical record not found for this pet");
        }

        return mapToMedicalRecordDTO(record);
    }

    @Transactional
    public MedicalRecordDTO createMedicalRecord(Long petId, CreateMedicalRecordRequest request, User owner) {
        Pet pet = validatePetOwnership(petId, owner);

        MedicalRecord record = MedicalRecord.builder()
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .date(request.getDate())
                .vetName(request.getVetName())
                .clinicName(request.getClinicName())
                .notes(request.getNotes())
                .prescription(request.getPrescription())
                .pet(pet)
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        return mapToMedicalRecordDTO(savedRecord);
    }

    @Transactional
    public MedicalRecordDTO updateMedicalRecord(Long petId, Long recordId, CreateMedicalRecordRequest request, User owner) {
        validatePetOwnership(petId, owner);

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (!record.getPet().getId().equals(petId)) {
            throw new ResourceNotFoundException("Medical record not found for this pet");
        }

        record.setType(request.getType());
        record.setTitle(request.getTitle());
        record.setDescription(request.getDescription());
        record.setDate(request.getDate());
        record.setVetName(request.getVetName());
        record.setClinicName(request.getClinicName());
        record.setNotes(request.getNotes());
        record.setPrescription(request.getPrescription());

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        return mapToMedicalRecordDTO(savedRecord);
    }

    @Transactional
    public void deleteMedicalRecord(Long petId, Long recordId, User owner) {
        validatePetOwnership(petId, owner);

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (!record.getPet().getId().equals(petId)) {
            throw new ResourceNotFoundException("Medical record not found for this pet");
        }

        medicalRecordRepository.delete(record);
    }

    // Vaccinations
    public List<VaccinationDTO> getVaccinations(Long petId, User owner) {
        validatePetOwnership(petId, owner);
        return vaccinationRepository.findByPetIdOrderByNextDueDateAsc(petId).stream()
                .map(this::mapToVaccinationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public VaccinationDTO createVaccination(Long petId, CreateVaccinationRequest request, User owner) {
        Pet pet = validatePetOwnership(petId, owner);

        Vaccination vaccination = Vaccination.builder()
                .name(request.getName())
                .dateAdministered(request.getDateAdministered())
                .nextDueDate(request.getNextDueDate())
                .batchNumber(request.getBatchNumber())
                .manufacturer(request.getManufacturer())
                .administeredBy(request.getAdministeredBy())
                .clinicName(request.getClinicName())
                .notes(request.getNotes())
                .pet(pet)
                .build();

        Vaccination savedVaccination = vaccinationRepository.save(vaccination);
        return mapToVaccinationDTO(savedVaccination);
    }

    @Transactional
    public VaccinationDTO updateVaccination(Long petId, Long vaccinationId, CreateVaccinationRequest request, User owner) {
        validatePetOwnership(petId, owner);

        Vaccination vaccination = vaccinationRepository.findById(vaccinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccination not found"));

        if (!vaccination.getPet().getId().equals(petId)) {
            throw new ResourceNotFoundException("Vaccination not found for this pet");
        }

        vaccination.setName(request.getName());
        vaccination.setDateAdministered(request.getDateAdministered());
        vaccination.setNextDueDate(request.getNextDueDate());
        vaccination.setBatchNumber(request.getBatchNumber());
        vaccination.setManufacturer(request.getManufacturer());
        vaccination.setAdministeredBy(request.getAdministeredBy());
        vaccination.setClinicName(request.getClinicName());
        vaccination.setNotes(request.getNotes());

        Vaccination savedVaccination = vaccinationRepository.save(vaccination);
        return mapToVaccinationDTO(savedVaccination);
    }

    @Transactional
    public void deleteVaccination(Long petId, Long vaccinationId, User owner) {
        validatePetOwnership(petId, owner);

        Vaccination vaccination = vaccinationRepository.findById(vaccinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccination not found"));

        if (!vaccination.getPet().getId().equals(petId)) {
            throw new ResourceNotFoundException("Vaccination not found for this pet");
        }

        vaccinationRepository.delete(vaccination);
    }

    // Health Summary
    public HealthSummaryDTO getHealthSummary(Long petId, User owner) {
        Pet pet = validatePetOwnership(petId, owner);

        List<MedicalRecord> recentRecords = medicalRecordRepository.findTop5ByPetIdOrderByDateDesc(petId);
        List<Vaccination> vaccinations = vaccinationRepository.findByPetIdOrderByNextDueDateAsc(petId);
        List<Vaccination> overdueVaccinations = vaccinationRepository.findOverdueVaccinations(petId, LocalDate.now());
        List<Vaccination> upcomingVaccinations = vaccinationRepository.findUpcomingVaccinations(
                petId, LocalDate.now(), LocalDate.now().plusDays(30));

        // Find last checkup
        LocalDate lastCheckup = recentRecords.stream()
                .filter(r -> r.getType() == RecordType.CHECKUP)
                .map(MedicalRecord::getDate)
                .findFirst()
                .orElse(null);

        // Find next vaccination
        LocalDate nextVaccination = vaccinations.stream()
                .filter(v -> v.getNextDueDate().isAfter(LocalDate.now()))
                .map(Vaccination::getNextDueDate)
                .findFirst()
                .orElse(null);

        // Build alerts
        List<HealthSummaryDTO.HealthAlertDTO> alerts = new ArrayList<>();

        for (Vaccination overdue : overdueVaccinations) {
            alerts.add(HealthSummaryDTO.HealthAlertDTO.builder()
                    .type("vaccination")
                    .message(overdue.getName() + " vaccination is overdue")
                    .severity("high")
                    .build());
        }

        for (Vaccination upcoming : upcomingVaccinations) {
            alerts.add(HealthSummaryDTO.HealthAlertDTO.builder()
                    .type("vaccination")
                    .message(upcoming.getName() + " vaccination due on " + upcoming.getNextDueDate())
                    .severity("medium")
                    .build());
        }

        return HealthSummaryDTO.builder()
                .petId(pet.getId())
                .petName(pet.getName())
                .lastCheckup(lastCheckup)
                .nextVaccination(nextVaccination)
                .currentWeight(pet.getWeight())
                .weightTrend("stable")
                .overallHealth("good")
                .totalRecords(recentRecords.size())
                .upcomingVaccinations(upcomingVaccinations.size())
                .overdueVaccinations(overdueVaccinations.size())
                .recentRecords(recentRecords.stream()
                        .map(this::mapToMedicalRecordDTO)
                        .collect(Collectors.toList()))
                .alerts(alerts)
                .build();
    }

    // Helper methods
    private Pet validatePetOwnership(Long petId, User owner) {
        return petRepository.findByIdAndOwnerId(petId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found or you don't have access"));
    }

    private MedicalRecordDTO mapToMedicalRecordDTO(MedicalRecord record) {
        return MedicalRecordDTO.builder()
                .id(record.getId())
                .type(record.getType())
                .title(record.getTitle())
                .description(record.getDescription())
                .date(record.getDate())
                .vetName(record.getVetName())
                .clinicName(record.getClinicName())
                .notes(record.getNotes())
                .prescription(record.getPrescription())
                .attachmentUrl(record.getAttachmentUrl())
                .petId(record.getPet().getId())
                .petName(record.getPet().getName())
                .createdAt(record.getCreatedAt())
                .build();
    }

    private VaccinationDTO mapToVaccinationDTO(Vaccination vaccination) {
        return VaccinationDTO.builder()
                .id(vaccination.getId())
                .name(vaccination.getName())
                .dateAdministered(vaccination.getDateAdministered())
                .nextDueDate(vaccination.getNextDueDate())
                .batchNumber(vaccination.getBatchNumber())
                .manufacturer(vaccination.getManufacturer())
                .administeredBy(vaccination.getAdministeredBy())
                .clinicName(vaccination.getClinicName())
                .notes(vaccination.getNotes())
                .status(vaccination.getStatus())
                .petId(vaccination.getPet().getId())
                .petName(vaccination.getPet().getName())
                .createdAt(vaccination.getCreatedAt())
                .build();
    }
}