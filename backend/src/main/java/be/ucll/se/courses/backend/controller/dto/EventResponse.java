package be.ucll.se.courses.backend.controller.dto;

import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String title,
        String description,
        String location,
        LocalDateTime startDate,
        LocalDateTime endDate
) {
    public EventResponse {
    }

}
