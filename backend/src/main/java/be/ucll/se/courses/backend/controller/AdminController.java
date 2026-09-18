package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.AdminUpdateUserRequest;
import be.ucll.se.courses.backend.controller.dto.UserSummaryDto;
import be.ucll.se.courses.backend.repository.RoleRepository;
import be.ucll.se.courses.backend.repository.UserRepository;
import be.ucll.se.courses.backend.unit.model.RoleName;
import be.ucll.se.courses.backend.unit.model.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Admin-only endpoints. Demonstrates role-based privilege separation:
 * an admin can view all users and modify role/enabled status — fields a
 * regular volunteer cannot touch via /api/volunteer/profile.
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only user management endpoints")
public class AdminController {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;

    public AdminController(UserRepository userRepo, RoleRepository roleRepo) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
    }

    @GetMapping("/users")
    @Operation(
            summary = "List all users",
            description = "Returns all registered users with their roles. Admin only."
    )
    public List<UserSummaryDto> listUsers() {
        return userRepo.findAll().stream()
                .map(UserSummaryDto::from)
                .toList();
    }

    @PatchMapping("/users/{id}")
    @Operation(
            summary = "Update user account",
            description = "Admin can update a user's enabled status and role. " +
                    "Volunteers can only update their own phone via /api/volunteer/profile."
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
        }

        if (request.role() != null) {
            RoleName roleName;
            try {
                roleName = RoleName.valueOf(request.role().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unknown role: " + request.role() + ". Valid: ADMIN, ORGANIZER, VOLUNTEER");
            }

            var role = roleRepo.findByName(roleName)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR, "Role not seeded"));

            user.getRoles().clear();
            user.addRole(role);
        }

        userRepo.save(user);
    }
}
