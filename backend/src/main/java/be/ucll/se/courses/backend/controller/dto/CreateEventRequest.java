package be.ucll.se.courses.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateEventRequest(
        @NotBlank String title,
        String description,
        @NotBlank String location,
        @NotNull LocalDateTime startDate,
        @NotNull LocalDateTime endDate
) {}
