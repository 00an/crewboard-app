package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.controller.dto.CreateEventRequest;
import be.ucll.se.courses.backend.repository.EventRepository;
import be.ucll.se.courses.backend.unit.model.Event;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EventService {

    private final EventRepository events;

    public EventService(EventRepository events) {
        this.events = events;
    }

    public Event create(CreateEventRequest req, String organizerEmail) {

        if (req.title() == null || req.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (req.startDate() == null || req.endDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start and end date required");
        }
        if (req.location() == null || req.location().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required");
        }
        if (req.endDate().isBefore(req.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date must be after start date");
        }

        Event event = new Event(
                req.title().trim(),
                req.startDate(),
                req.endDate()
        );

        event.setDescription(req.description());
        event.setLocation(req.location().trim());
        event.setOrganizerEmail(organizerEmail);

        return events.save(event);
    }
}
