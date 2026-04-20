package backend.vet.service;

import backend.common.exception.ResourceNotFoundException;
import backend.vet.dto.NearbyVetRequest;
import backend.vet.dto.VetClinicDTO;
import backend.vet.model.VetClinic;
import backend.vet.repository.VetClinicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VetService {

    private final VetClinicRepository vetClinicRepository;

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

    private Double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int R = 6371; // Earth's radius in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c * 1000; // Convert to meters
    }
}