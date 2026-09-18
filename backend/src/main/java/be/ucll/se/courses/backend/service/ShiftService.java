package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.controller.dto.CreateShiftRequest;
import be.ucll.se.courses.backend.controller.dto.UpdateShiftRequest;
import be.ucll.se.courses.backend.repository.EventRepository;
import be.ucll.se.courses.backend.repository.ShiftRepository;
import be.ucll.se.courses.backend.unit.model.Event;
import be.ucll.se.courses.backend.unit.model.Shift;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ShiftService {

    private final EventRepository events;
    private final ShiftRepository shifts;

    public ShiftService(EventRepository events, ShiftRepository shifts) {
        this.events = events;
        this.shifts = shifts;
    }

    public Shift create(Long eventId, CreateShiftRequest req, Authentication auth) {

        Event event = events.findById(eventId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        verifyOrganizerOwnership(event, auth);

        if (req.role() == null || req.role().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }
        if (req.startTime() == null || req.endTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start and end time required");
        }
        if (req.headcount() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Headcount must be positive");
        }

        Shift shift = new Shift(
                event,
                req.role().trim(),
                req.startTime(),
                req.endTime(),
                req.headcount()
        );

        shift.setLocation(req.location()); // optional field

        return shifts.save(shift);
    }

    public Shift update(Long eventId, Long shiftId, UpdateShiftRequest req, Authentication auth) {

        Event event = events.findById(eventId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        verifyOrganizerOwnership(event, auth);

        Shift shift = shifts.findById(shiftId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Shift not found"));

        if (!shift.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Shift not found for this event");
        }

        if (req.endTime().isBefore(req.startTime()) || req.endTime().isEqual(req.startTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        shift.setRole(req.role().trim());
        shift.setLocation(req.location());
        shift.setStartTime(req.startTime());
        shift.setEndTime(req.endTime());
        shift.setHeadcount(req.headcount());

        return shifts.save(shift);
    }

    private void verifyOrganizerOwnership(Event event, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        String organizerEmail = event.getOrganizerEmail();
        if (organizerEmail == null || !organizerEmail.equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}