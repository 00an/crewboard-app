package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.CreateEventRequest;
import be.ucll.se.courses.backend.controller.dto.EventResponse;
import be.ucll.se.courses.backend.repository.EventRepository;
import be.ucll.se.courses.backend.service.EventService;
import be.ucll.se.courses.backend.unit.model.Event;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@Tag(
        name = "Events",
        description = "Event management endpoints"
)
public class EventController {

    private final EventService service;
    private final EventRepository repo;

    public EventController(EventService service, EventRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    /** Create event (Story 1) */
    @PostMapping
    @Operation(
            summary = "Create a new event",
            description = "Creates a new event with title, description, location, and date range"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid event data")
    })
    public EventResponse create(@Valid @RequestBody CreateEventRequest req, Authentication authentication) {
        // Returned as a DTO for the same reason getById() is below: Event
        // carries a bidirectional relationship to Shift that isn't safe to
        // serialize directly. A brand-new event has no shifts yet so this
        // particular call was never at risk in practice, but returning the
        // entity here was one edit away from reintroducing the same bug.
        Event event = service.create(req, authentication.getName());
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getStartDate(),
                event.getEndDate()
        );
    }

    @GetMapping("/{eventId}")
    @Operation(
            summary = "Get a single event",
            description = "Returns one event by id"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event returned"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public EventResponse getById(@PathVariable Long eventId) {
        Event event = repo.findById(eventId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        // Returned as a DTO, never the raw entity: Event <-> Shift is a
        // bidirectional JPA relationship with no @JsonIgnore/@JsonBackReference
        // on either side, so serializing the entity directly recurses forever
        // the moment an event actually has shifts attached (event -> shifts ->
        // each shift's event -> its shifts -> ...), producing truncated,
        // invalid JSON on the wire instead of a clean error.
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getStartDate(),
                event.getEndDate()
        );
    }

    @GetMapping
    @Operation(
            summary = "Get all events",
            description = "Returns a list of all events"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of events returned")
    })
    public List<EventResponse> all() {
        return repo.findAll().stream()
                .map(event -> new EventResponse(
                        event.getId(),
                        event.getTitle(),
                        event.getDescription(),
                        event.getLocation(),
                        event.getStartDate(),
                        event.getEndDate()
                ))
                .toList();
    }
}
