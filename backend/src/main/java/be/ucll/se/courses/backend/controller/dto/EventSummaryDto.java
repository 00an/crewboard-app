package be.ucll.se.courses.backend.controller.dto;

import java.time.LocalDateTime;

public record EventSummaryDto(
        Long id,
        String title,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String location
) {}