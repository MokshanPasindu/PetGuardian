// backend/breed/model/BreedScanResult.java
package backend.breed.model;

import backend.pet.model.Pet;
import backend.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "breed_scan_results")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BreedScanResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Relationships ─────────────────────────────────────────────────────────
    // Pet is optional — scan may happen before pet registration
    // Pet.java confirmed: @Id Long id, @ManyToOne User owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    // User is required — every scan belongs to an authenticated user
    // User.java confirmed: @Id Long id, email, role fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ── AI Prediction Results ─────────────────────────────────────────────────
    @Column(name = "predicted_breed", nullable = false)
    private String predictedBreed;

    @Column(name = "predicted_category", nullable = false)
    private String predictedCategory;

    // Confidence score: 0.0 → 100.0
    @Column(name = "confidence")
    private Double confidence;

    // Path stored by StorageService.store() e.g. "breed-scans/uuid.jpg"
    @Column(name = "image_path")
    private String imagePath;

    // True when this scan result was used to auto-fill a pet registration form
    @Column(name = "used_for_registration")
    private boolean usedForRegistration = false;

    // ── Timestamps ────────────────────────────────────────────────────────────
    // Uses Spring Data @CreatedDate — matches pattern from Pet.java & User.java
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}