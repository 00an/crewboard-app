package be.ucll.se.courses.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record CreateShiftRequest(
        @NotBlank String role,
        String location,
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime,
        @Positive int headcount
) {}
