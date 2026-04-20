package backend.vet.repository;


import backend.vet.model.VetClinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VetClinicRepository extends JpaRepository<VetClinic, Long> {

    List<VetClinic> findByIsEmergencyTrue();

    List<VetClinic> findByIsOpenTrue();

    @Query("SELECT v FROM VetClinic v WHERE " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(v.latitude)) * " +
            "cos(radians(v.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(v.latitude)))) <= :radius " +
            "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(v.latitude)) * " +
            "cos(radians(v.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(v.latitude)))) ASC")
    List<VetClinic> findNearbyVets(@Param("lat") Double latitude,
                                   @Param("lng") Double longitude,
                                   @Param("radius") Double radiusInKm);

    List<VetClinic> findByNameContainingIgnoreCase(String name);
}