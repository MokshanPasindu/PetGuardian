// backend/vet/service/VetService.java
package backend.vet.service;

import backend.common.exception.ResourceNotFoundException;
import backend.vet.dto.NearbyVetRequest;
import backend.vet.dto.VetClinicDTO;
import backend.vet.dto.VetClinicRequest;
import backend.vet.model.VetClinic;
import backend.vet.repository.VetClinicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VetService {

    private final VetClinicRepository vetClinicRepository;

    // ─── Existing Methods (unchanged) ───────────────────────────────────────

    public List<VetClinicDTO> getAllVets() {
        return vetClinicRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public VetClinicDTO getVetById(Long id) {
        VetClinic clinic = vetClinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vet clinic not found"));
        return mapToDTO(clinic);
    }

    public List<VetClinicDTO> getNearbyVets(NearbyVetRequest request) {
        List<VetClinic> clinics = vetClinicRepository.findNearbyVets(
                request.getLat(), request.getLng(), request.getRadius());

        return clinics.stream()
                .map(clinic -> {
                    VetClinicDTO dto = mapToDTO(clinic);
                    dto.setDistance(calculateDistance(
                            request.getLat(), request.getLng(),
                            clinic.getLatitude(), clinic.getLongitude()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<VetClinicDTO> getEmergencyVets() {
        return vetClinicRepository.findByIsEmergencyTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<VetClinicDTO> searchVets(String query) {
        return vetClinicRepository.findByNameContainingIgnoreCase(query).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ─── NEW: Admin CRUD Methods ─────────────────────────────────────────────

    @Transactional
    public VetClinicDTO createClinic(VetClinicRequest request) {
        log.info("Admin creating new vet clinic: {}", request.getName());

        VetClinic clinic = VetClinic.builder()
                .name(request.getName())
                .specialization(request.getSpecialization())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .hours(request.getHours())
                .image(request.getImage())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .rating(request.getRating())
                .reviewCount(request.getReviewCount())
                .isEmergency(request.isEmergency())
                .isOpen(request.isOpen())
                .services(request.getServices())
                .description(request.getDescription())
                .build();

        VetClinic saved = vetClinicRepository.save(clinic);
        log.info("Vet clinic created successfully with id: {}", saved.getId());
        return mapToDTO(saved);
    }

    @Transactional
    public VetClinicDTO updateClinic(Long id, VetClinicRequest request) {
        log.info("Admin updating vet clinic: {}", id);

        VetClinic clinic = vetClinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vet clinic not found"));

        clinic.setName(request.getName());
        clinic.setSpecialization(request.getSpecialization());
        clinic.setAddress(request.getAddress());
        clinic.setPhone(request.getPhone());
        clinic.setEmail(request.getEmail());
        clinic.setHours(request.getHours());
        clinic.setLatitude(request.getLatitude());
        clinic.setLongitude(request.getLongitude());
        clinic.setRating(request.getRating());
        clinic.setReviewCount(request.getReviewCount());
        clinic.setEmergency(request.isEmergency());
        clinic.setOpen(request.isOpen());
        clinic.setServices(request.getServices());
        clinic.setDescription(request.getDescription());

        // Only update image if a new one is provided
        if (request.getImage() != null && !request.getImage().isBlank()) {
            clinic.setImage(request.getImage());
        }

        VetClinic saved = vetClinicRepository.save(clinic);
        log.info("Vet clinic updated successfully: {}", id);
        return mapToDTO(saved);
    }

    @Transactional
    public void deleteClinic(Long id) {
        log.info("Admin deleting vet clinic: {}", id);

        VetClinic clinic = vetClinicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vet clinic not found"));

        vetClinicRepository.delete(clinic);
        log.info("Vet clinic deleted successfully: {}", id);
    }

    public long getTotalClinicCount() {
        return vetClinicRepository.count();
    }

    // ─── Mapping ────────────────────────────────────────────────────────────

    private VetClinicDTO mapToDTO(VetClinic clinic) {
        List<String> services = clinic.getServices() != null
                ? Arrays.asList(clinic.getServices().split(","))
                : List.of();

        return VetClinicDTO.builder()
                .id(clinic.getId())
                .name(clinic.getName())
                .specialization(clinic.getSpecialization())
                .address(clinic.getAddress())
                .phone(clinic.getPhone())
                .email(clinic.getEmail())
                .hours(clinic.getHours())
                .image(clinic.getImage())
                .latitude(clinic.getLatitude())
                .longitude(clinic.getLongitude())
                .rating(clinic.getRating())
                .reviewCount(clinic.getReviewCount())
                .isEmergency(clinic.isEmergency())
                .isOpen(clinic.isOpen())
                .services(services)
                .description(clinic.getDescription())
                .build();
    }

    private Double calculateDistance(
            Double lat1, Double lon1,
            Double lat2, Double lon2) {

        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000;
    }
}