// backend/breed/repository/BreedScanResultRepository.java
package backend.breed.repository;

import backend.breed.model.BreedScanResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BreedScanResultRepository extends JpaRepository<BreedScanResult, Long> {

    // Used by BreedService.getUserBreedScans(userId)
    List<BreedScanResult> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Used by BreedService.getPetBreedScans(petId)
    List<BreedScanResult> findByPetIdOrderByCreatedAtDesc(Long petId);

    // Used to find most recent scan for a specific pet
    BreedScanResult findTopByPetIdOrderByCreatedAtDesc(Long petId);
}