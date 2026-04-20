package backend.medical.model;


import backend.pet.model.Pet;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccinations")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate dateAdministered;

    @Column(nullable = false)
    private LocalDate nextDueDate;

    private String batchNumber;

    private String manufacturer;

    private String administeredBy;

    private String clinicName;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public String getStatus() {
        LocalDate today = LocalDate.now();
        if (nextDueDate.isBefore(today)) {
            return "OVERDUE";
        } else if (nextDueDate.isBefore(today.plusDays(30))) {
            return "UPCOMING";
        }
        return "COMPLETED";
    }
}