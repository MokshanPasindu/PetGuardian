package backend.admin.service;

import backend.common.dto.PagedResponse;
import backend.common.exception.BadRequestException;
import backend.common.exception.ResourceNotFoundException;
import backend.user.dto.UserDTO;
import backend.user.model.Role;
import backend.user.model.User;
import backend.user.repository.UserRepository;
import backend.admin.dto.UserStatsDTO;
import backend.pet.repository.PetRepository;
import backend.community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final PostRepository postRepository;

    public PagedResponse<UserDTO> getAllUsers(int page, int size, Role role, String search, String sortBy, String sortOrder) {
        log.info("Admin fetching users - page: {}, size: {}, role: {}, search: {}", page, size, role, search);

        Sort.Direction direction = sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<User> users;

        if (search != null && !search.trim().isEmpty()) {
            // Search by name or email
            users = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, search, pageable);
        } else if (role != null) {
            // Filter by role
            users = userRepository.findByRole(role, pageable);
        } else {
            // Get all users
            users = userRepository.findAll(pageable);
        }

        List<UserDTO> userDTOs = users.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                userDTOs,
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages(),
                users.isLast()
        );
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);

    }

    @Transactional
    public UserDTO changeUserRole(Long id, Role newRole) {
        log.info("Changing user {} role to {}", id, newRole);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRole(newRole);
        User savedUser = userRepository.save(user);

        log.info("User {} role changed to {} successfully", id, newRole);
        return mapToDTO(savedUser);
    }

    @Transactional
    public UserDTO toggleUserBan(Long id) {
        log.info("Toggling ban status for user {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEnabled(!user.isEnabled());
        User savedUser = userRepository.save(user);

        log.info("User {} ban status toggled. Enabled: {}", id, savedUser.isEnabled());
        return mapToDTO(savedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Prevent deleting yourself
        // You might want to add current user check here

        userRepository.delete(user);
        log.info("User {} deleted successfully", id);
    }

    public UserStatsDTO getStatistics() {
        long totalUsers = userRepository.count();
        long ownersCount = userRepository.countByRole(Role.OWNER);
        long vetsCount = userRepository.countByRole(Role.VET);
        long adminsCount = userRepository.countByRole(Role.ADMIN);
        long totalPets = petRepository.count();
        long totalPosts = postRepository.count();

        // Get users registered in last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newUsersLast30Days = userRepository.countByCreatedAtAfter(thirtyDaysAgo);

        return UserStatsDTO.builder()
                .totalUsers(totalUsers)
                .ownersCount(ownersCount)
                .vetsCount(vetsCount)
                .adminsCount(adminsCount)
                .totalPets(totalPets)
                .totalPosts(totalPosts)
                .newUsersLast30Days(newUsersLast30Days)
                .build();
    }

    public List<UserDTO> getRecentUsers(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return userRepository.findAll(pageable).getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getUserCountByRole() {
        Map<String, Long> roleCounts = new HashMap<>();
        roleCounts.put("OWNER", userRepository.countByRole(Role.OWNER));
        roleCounts.put("VET", userRepository.countByRole(Role.VET));
        roleCounts.put("ADMIN", userRepository.countByRole(Role.ADMIN));
        return roleCounts;
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .name(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}