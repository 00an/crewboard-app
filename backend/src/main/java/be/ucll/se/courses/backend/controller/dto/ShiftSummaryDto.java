package be.ucll.se.courses.backend.controller.dto;

import java.time.LocalDateTime;

public record ShiftSummaryDto(
        Long id,
        String role,
        String location,
        LocalDateTime startTime,
        LocalDateTime endTime,
        int headcount,
        long assignedCount,
        Long myAssignmentId,
        EventSummaryDto event
) {}