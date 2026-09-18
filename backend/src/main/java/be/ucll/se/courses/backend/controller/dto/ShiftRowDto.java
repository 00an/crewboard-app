package be.ucll.se.courses.backend.controller.dto;

import java.time.LocalDateTime;

public record ShiftRowDto(
        Long shiftId,
        String shiftRole,
        String shiftLocation,
        LocalDateTime shiftStartTime,
        LocalDateTime shiftEndTime,
        int shiftHeadcount,
        long assignedCount,

        Long eventId,
        String eventTitle,
        LocalDateTime eventStartDate,
        LocalDateTime eventEndDate,
        String eventLocation
) {}
