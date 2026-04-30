package backend.ai.model;

import backend.pet.model.Pet;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "scan_results")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Image
    @Column(nullable = false)
    private String imageUrl;

    // Core prediction — matches Flask response
    @Column(nullable = false)
    private String prediction;          // predictedClass from Flask

    @Column(nullable = false)
    private Double confidence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    // Guidance from Flask
    @Column(columnDefinition = "TEXT")
    private String guidance;

    @Column(columnDefinition = "TEXT")
    private String disclaimer;

    @Column
    private Boolean vetConnectTriggered;

    // Stored as semicolon-separated string (existing pattern)
    @Column(length = 2000)
    private String recommendations;     // homeCareSteps joined

    // Stored as JSON string
    @Column(length = 2000)
    private String possibleConditions;  // allPredictions serialized

    private boolean savedToMedicalHistory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}