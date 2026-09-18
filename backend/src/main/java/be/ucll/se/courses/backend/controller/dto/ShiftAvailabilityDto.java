package be.ucll.se.courses.backend.controller.dto;

import java.time.LocalDateTime;

public record ShiftAvailabilityDto(
        Long shiftId,
        String role,
        LocalDateTime startTime,
        LocalDateTime endTime,
        boolean available
) {}
