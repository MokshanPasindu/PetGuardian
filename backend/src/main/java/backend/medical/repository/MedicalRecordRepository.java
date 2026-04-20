package backend.medical.repository;


import backend.medical.model.MedicalRecord;
import backend.medical.model.RecordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPetIdOrderByDateDesc(Long petId);
    List<MedicalRecord> findByPetIdAndTypeOrderByDateDesc(Long petId, RecordType type);
    List<MedicalRecord> findTop5ByPetIdOrderByDateDesc(Long petId);
}