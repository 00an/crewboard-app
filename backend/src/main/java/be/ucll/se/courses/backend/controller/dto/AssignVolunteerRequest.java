package be.ucll.se.courses.backend.controller.dto;

import jakarta.validation.constraints.NotNull;

public record AssignVolunteerRequest(
        @NotNull Long shiftId,
        @NotNull Long volunteerId
) {}
