package be.ucll.se.courses.backend.controller.dto;

import java.time.LocalDateTime;

public record ShiftResponse(
        Long id,
        String role,
        String location,
        LocalDateTime startTime,
        LocalDateTime endTime,
        int headcount
) {}
