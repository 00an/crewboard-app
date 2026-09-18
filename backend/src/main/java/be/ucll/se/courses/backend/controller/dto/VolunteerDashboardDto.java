package be.ucll.se.courses.backend.controller.dto;

import java.util.List;

public record VolunteerDashboardDto(
        List<AssignedShiftDto> assignedShifts,
        List<ShiftSummaryDto> openShifts,
        List<ShiftSummaryDto> dismissedOpenShifts,
        List<EventNeedHelpDto> eventsNeedingHelp
) {}