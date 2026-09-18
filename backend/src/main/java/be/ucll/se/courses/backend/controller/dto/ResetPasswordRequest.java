package be.ucll.se.courses.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank String newPassword
) {}
