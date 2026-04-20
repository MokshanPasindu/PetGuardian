package backend.admin.controller;

import backend.common.dto.ApiResponse;
import backend.common.dto.PagedResponse;
import backend.user.dto.UserDTO;
import backend.user.model.Role;
import backend.admin.dto.UpdateUserRoleRequest;
import backend.admin.dto.UserStatsDTO;
import backend.admin.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management APIs")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "Get all users with pagination and filters")
    public ResponseEntity<PagedResponse<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        return ResponseEntity.ok(adminService.getAllUsers(page, size, role, search, sortBy, sortOrder));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Change user role")
    public ResponseEntity<UserDTO> changeUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(adminService.changeUserRole(id, request.getRole()));
    }

    @PutMapping("/users/{id}/ban")
    @Operation(summary = "Ban/Unban user")
    public ResponseEntity<UserDTO> toggleUserBan(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserBan(id));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user permanently")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<UserStatsDTO> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }

    @GetMapping("/users/recent")
    @Operation(summary = "Get recently registered users")
    public ResponseEntity<List<UserDTO>> getRecentUsers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminService.getRecentUsers(limit));
    }

    @GetMapping("/users/by-role")
    @Operation(summary = "Get users count by role")
    public ResponseEntity<?> getUsersByRole() {
        return ResponseEntity.ok(adminService.getUserCountByRole());
    }
}