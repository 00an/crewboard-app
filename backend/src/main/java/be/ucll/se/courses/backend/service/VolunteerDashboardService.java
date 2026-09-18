// src/main/java/be/ucll/se/courses/backend/service/VolunteerDashboardService.java
package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.controller.dto.*;
import be.ucll.se.courses.backend.repository.AssignmentRepository;
import be.ucll.se.courses.backend.repository.AvailabilityRepository;
import be.ucll.se.courses.backend.repository.ShiftRepository;
import be.ucll.se.courses.backend.repository.VolunteerRepository;
import be.ucll.se.courses.backend.unit.model.Assignment;
import be.ucll.se.courses.backend.unit.model.AssignmentStatus;
import be.ucll.se.courses.backend.unit.model.Shift;
import be.ucll.se.courses.backend.unit.model.Volunteer;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class VolunteerDashboardService {

    private final VolunteerRepository volunteerRepo;
    private final AssignmentRepository assignmentRepo;
    private final ShiftRepository shiftRepo;
    private final AvailabilityRepository availabilityRepo;

    public VolunteerDashboardService(
            VolunteerRepository volunteerRepo,
            AssignmentRepository assignmentRepo,
            ShiftRepository shiftRepo,
            AvailabilityRepository availabilityRepo
    ) {
        this.volunteerRepo = volunteerRepo;
        this.assignmentRepo = assignmentRepo;
        this.shiftRepo = shiftRepo;
        this.availabilityRepo = availabilityRepo;
    }

    public VolunteerDashboardDto getDashboard(String username) {
        Volunteer volunteer = volunteerRepo.findByUserUsername(username)
                .or(() -> volunteerRepo.findByUserEmail(username))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Volunteer not found"));

        Long volunteerId = volunteer.getId();

        List<AssignedShiftDto> assigned = getAssignedShifts(volunteerId);

        // 1) Get open shifts excluding ones you're already assigned to
        List<ShiftSummaryDto> allOpenExcludingMine = getOpenShiftsExcludingMyShifts(assigned);

        // 2) Split open shifts into (visible open) + (dismissed)
        Set<Long> dismissedIds = new HashSet<>(availabilityRepo.findDismissedShiftIds(volunteerId));

        List<ShiftSummaryDto> open = new ArrayList<>();
        List<ShiftSummaryDto> dismissedOpen = new ArrayList<>();

        for (ShiftSummaryDto s : allOpenExcludingMine) {
            if (dismissedIds.contains(s.id())) dismissedOpen.add(s);
            else open.add(s);
        }

        // 3) Events needing help should be based on OPEN only (not dismissed)
        List<EventNeedHelpDto> eventsNeedingHelp = aggregateEventsNeedingHelp(open);

        return new VolunteerDashboardDto(assigned, open, dismissedOpen, eventsNeedingHelp);
    }

    public void joinShift(String username, Long shiftId) {
        Volunteer volunteer = volunteerRepo.findByUserUsername(username)
                .or(() -> volunteerRepo.findByUserEmail(username))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Volunteer not found"));

        Long volunteerId = volunteer.getId();

        if (assignmentRepo.existsByVolunteerIdAndShiftId(volunteerId, shiftId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already joined this shift");
        }

        Shift shift = shiftRepo.findById(shiftId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shift not found"));

        long confirmed = assignmentRepo.countByShiftIdAndStatus(shiftId, AssignmentStatus.CONFIRMED);
        if (confirmed >= shift.getHeadcount()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Shift is full");
        }

        boolean overlap = !assignmentRepo.findOverlappingConfirmedAssignments(
                volunteerId,
                shift.getStartTime(),
                shift.getEndTime()
        ).isEmpty();

        if (overlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Shift overlaps with an existing assignment");
        }

        // If the volunteer had dismissed this shift, undo that automatically on join
        availabilityRepo.deleteByVolunteerIdAndShiftId(volunteerId, shiftId);

        assignmentRepo.save(new Assignment(volunteer, shift));
    }

    public void leaveAssignment(String username, Long assignmentId) {
        Volunteer volunteer = volunteerRepo.findByUserUsername(username)
                .or(() -> volunteerRepo.findByUserEmail(username))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Volunteer not found"));

        Assignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        if (!a.getVolunteer().getId().equals(volunteer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your assignment");
        }

        assignmentRepo.delete(a);
    }

    /* =============================
       Internal helpers
       ============================= */

    private List<AssignedShiftDto> getAssignedShifts(Long volunteerId) {
        return assignmentRepo.findByVolunteerIdWithShiftAndEvent(volunteerId).stream()
                .filter(a -> a.getStatus() == AssignmentStatus.CONFIRMED)
                .sorted(Comparator.comparing(a -> a.getShift().getStartTime()))
                .map(AssignedShiftDto::from)
                .toList();
    }

    private List<ShiftSummaryDto> getOpenShiftsExcludingMyShifts(List<AssignedShiftDto> assigned) {
        Set<Long> myShiftIds = assigned.stream()
                .map(AssignedShiftDto::shiftId)
                .collect(Collectors.toSet());

        return shiftRepo.findOpenShiftRows().stream()
                .map(r -> toShiftSummary(r, null))
                .filter(s -> !myShiftIds.contains(s.id()))
                .sorted(Comparator.comparing(ShiftSummaryDto::startTime))
                .toList();
    }

    private ShiftSummaryDto toShiftSummary(ShiftRowDto r, Long myAssignmentId) {
        EventSummaryDto event = new EventSummaryDto(
                r.eventId(),
                r.eventTitle(),
                r.eventStartDate(),
                r.eventEndDate(),
                r.eventLocation()
        );

        return new ShiftSummaryDto(
                r.shiftId(),
                r.shiftRole(),
                r.shiftLocation(),
                r.shiftStartTime(),
                r.shiftEndTime(),
                r.shiftHeadcount(),
                r.assignedCount(),
                myAssignmentId,
                event
        );
    }

    private List<EventNeedHelpDto> aggregateEventsNeedingHelp(List<ShiftSummaryDto> openShifts) {
        Map<Long, List<ShiftSummaryDto>> byEvent = openShifts.stream()
                .collect(Collectors.groupingBy(s -> s.event().id()));

        List<EventNeedHelpDto> out = new ArrayList<>();
        for (var entry : byEvent.entrySet()) {
            EventSummaryDto e = entry.getValue().get(0).event();
            out.add(new EventNeedHelpDto(
                    e.id(),
                    e.title(),
                    e.startDate(),
                    e.endDate(),
                    e.location(),
                    entry.getValue().size()
            ));
        }

        out.sort(Comparator.comparing(EventNeedHelpDto::startDate));
        return out;
    }
}
