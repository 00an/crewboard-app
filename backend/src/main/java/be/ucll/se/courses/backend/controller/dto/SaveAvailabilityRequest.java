package be.ucll.se.courses.backend.controller.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SaveAvailabilityRequest(
        @NotNull List<Long> shiftIds
) {}
