package be.ucll.se.courses.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank String newPassword
) {}
