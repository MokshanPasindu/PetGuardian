// backend/user/repository/UserRepository.java
package backend.user.repository;

import backend.user.model.Role;
import backend.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetToken(String resetToken);

    // ❌ REMOVED — findByUsername(String username)
    // User.java has NO 'username' field
    // User uses 'email' as the login identifier
    // User.getUsername() returns email (confirmed from User.java)

    // ── Admin queries ─────────────────────────────────────────────────────────
    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String firstName,
            String lastName,
            String email,
            Pageable pageable
    );

    long countByRole(Role role);

    long countByCreatedAtAfter(LocalDateTime date);
}