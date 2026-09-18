package be.ucll.se.courses.backend.controller.dto;

import java.time.LocalDateTime;

public record EventNeedHelpDto(
        Long id,
        String title,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String location,
        long openShiftCount
) {}