package be.ucll.se.courses.backend.controller.dto;

import be.ucll.se.courses.backend.unit.model.Assignment;

import java.time.LocalDateTime;

public record AssignedShiftDto(
        Long assignmentId,
        Long shiftId,
        String eventTitle,
        String role,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location
) {
    public static AssignedShiftDto from(Assignment a) {
        return new AssignedShiftDto(
                a.getId(),
                a.getShift().getId(),
                a.getShift().getEvent().getTitle(),
                a.getShift().getRole(),
                a.getShift().getStartTime(),
                a.getShift().getEndTime(),
                a.getShift().getLocation()
        );
    }
}
