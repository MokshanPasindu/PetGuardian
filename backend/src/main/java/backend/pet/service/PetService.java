package backend.pet.service;

import backend.common.exception.ResourceNotFoundException;
import backend.pet.dto.CreatePetRequest;
import backend.pet.dto.PetDTO;
import backend.pet.dto.UpdatePetRequest;
import backend.pet.model.Pet;
import backend.pet.model.PetType;
import backend.pet.repository.PetRepository;
import backend.storage.StorageService;
import backend.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PetService {

    private final PetRepository petRepository;
    private final StorageService storageService;

    public List<PetDTO> getPetsByOwner(User owner) {
        return petRepository.findByOwner(owner).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PetDTO getPetById(Long id, User owner) {
        Pet pet = petRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + id));
        return mapToDTO(pet);
    }

    public PetDTO getPetByQrCode(String qrCode) {
        Pet pet = petRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with QR code: " + qrCode));
        return mapToDTO(pet);
    }

    @Transactional
    public PetDTO createPet(CreatePetRequest request, MultipartFile image, User owner) {
        log.info("Creating pet for user: {}", owner.getEmail());

        // Set default birth date if not provided
        LocalDate birthDate = request.getBirthDate();
        if (birthDate == null) {
            birthDate = LocalDate.now().minusYears(1);
        }

        Pet pet = Pet.builder()
                .name(request.getName())
                .type(request.getType() != null ? request.getType() : PetType.DOG)
                .breed(request.getBreed())
                .birthDate(birthDate)
                .gender(request.getGender())
                .weight(request.getWeight())
                .color(request.getColor())
                .microchipId(request.getMicrochipId())
                .notes(request.getNotes())
                .owner(owner)
                .build();

        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = storageService.store(image, "pets");
                pet.setImage(imageUrl);
            } catch (Exception e) {
                log.error("Failed to store image", e);
                // Continue without image
            }
        }

        Pet savedPet = petRepository.save(pet);
        log.info("Pet created successfully with id: {}", savedPet.getId());
        return mapToDTO(savedPet);
    }

    @Transactional
    public PetDTO updatePet(Long id, UpdatePetRequest request, MultipartFile image, User owner) {
        Pet pet = petRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + id));

        if (request.getName() != null) pet.setName(request.getName());
        if (request.getType() != null) pet.setType(request.getType());
        if (request.getBreed() != null) pet.setBreed(request.getBreed());
        if (request.getBirthDate() != null) pet.setBirthDate(request.getBirthDate());
        if (request.getGender() != null) pet.setGender(request.getGender());
        if (request.getWeight() != null) pet.setWeight(request.getWeight());
        if (request.getColor() != null) pet.setColor(request.getColor());
        if (request.getMicrochipId() != null) pet.setMicrochipId(request.getMicrochipId());
        if (request.getNotes() != null) pet.setNotes(request.getNotes());

        if (image != null && !image.isEmpty()) {
            try {
                // Delete old image if exists
                if (pet.getImage() != null) {
                    storageService.delete(pet.getImage());
                }
                String imageUrl = storageService.store(image, "pets");
                pet.setImage(imageUrl);
            } catch (Exception e) {
                log.error("Failed to update image", e);
            }
        }

        Pet savedPet = petRepository.save(pet);
        return mapToDTO(savedPet);
    }

    @Transactional
    public PetDTO uploadImage(Long id, MultipartFile file, User owner) {
        Pet pet = petRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + id));

        // Delete old image if exists
        if (pet.getImage() != null) {
            storageService.delete(pet.getImage());
        }

        String imageUrl = storageService.store(file, "pets");
        pet.setImage(imageUrl);

        Pet savedPet = petRepository.save(pet);
        return mapToDTO(savedPet);
    }

    @Transactional
    public void deletePet(Long id, User owner) {
        Pet pet = petRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + id));

        if (pet.getImage() != null) {
            try {
                storageService.delete(pet.getImage());
            } catch (Exception e) {
                log.error("Failed to delete image", e);
            }
        }

        petRepository.delete(pet);
    }

    @Transactional
    public String regenerateQrCode(Long id, User owner) {
        Pet pet = petRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + id));

        pet.generateQRCode();
        Pet savedPet = petRepository.save(pet);
        return savedPet.getQrCode();
    }
    private PetDTO mapToDTO(Pet pet) {
        String imageUrl = null;
        if (pet.getImage() != null && !pet.getImage().isEmpty()) {
            imageUrl = storageService.getFileUrl(pet.getImage()); // ✅ Get full URL
        }

        return PetDTO.builder()
                .id(pet.getId())
                .name(pet.getName())
                .type(pet.getType())
                .breed(pet.getBreed())
                .birthDate(pet.getBirthDate())
                .gender(pet.getGender())
                .weight(pet.getWeight())
                .color(pet.getColor())
                .microchipId(pet.getMicrochipId())
                .image(imageUrl)  // ✅ Now returns full URL like: http://localhost:8080/uploads/pets/xxx.jpg
                .notes(pet.getNotes())
                .qrCode(pet.getQrCode())
                .ownerId(pet.getOwner().getId())
                .ownerName(pet.getOwner().getFullName())
                .createdAt(pet.getCreatedAt())
                .build();
    }
}