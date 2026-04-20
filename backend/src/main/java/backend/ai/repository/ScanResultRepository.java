package backend.ai.repository;


import backend.ai.model.ScanResult;
import backend.ai.model.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanResultRepository extends JpaRepository<ScanResult, Long> {
    List<ScanResult> findByPetIdOrderByCreatedAtDesc(Long petId);
    List<ScanResult> findByPetOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<ScanResult> findByPetIdAndSeverityOrderByCreatedAtDesc(Long petId, Severity severity);
    long countByPetOwnerId(Long ownerId);
}