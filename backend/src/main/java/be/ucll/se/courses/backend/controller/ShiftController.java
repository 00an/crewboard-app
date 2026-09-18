package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.CreateShiftRequest;
import be.ucll.se.courses.backend.controller.dto.ShiftResponse;
import be.ucll.se.courses.backend.controller.dto.UpdateShiftRequest;
import be.ucll.se.courses.backend.repository.ShiftRepository;
import be.ucll.se.courses.backend.service.ShiftService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/shifts")
@Tag(
        name = "Shifts",
        description = "Shift management for events"
)
public class ShiftController {

    private final ShiftService service;
    private final ShiftRepository repo;

    public ShiftController(ShiftService service, ShiftRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    /** Create shift (Event organiser — must own the event) */
    @PostMapping
    @Operation(
            summary = "Create a shift for an event",
            description = "Creates a new shift for the specified event. Only the organizer who owns the event (or an admin) may do this."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shift created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid shift data"),
            @ApiResponse(responseCode = "403", description = "Access denied — not the event owner"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ShiftResponse create(
            @PathVariable Long eventId,
            @Valid @RequestBody CreateShiftRequest req,
            Authentication authentication
    ) {
        var shift = service.create(eventId, req, authentication);
        return toResponse(shift.getId(), shift.getRole(), shift.getLocation(),
                shift.getStartTime(), shift.getEndTime(), shift.getHeadcount());
    }

    /** Update shift (Event organiser — must own the event) */
    @PatchMapping("/{shiftId}")
    @Operation(
            summary = "Update a shift",
            description = "Replaces the editable fields of a shift. Only the organizer who owns the event (or an admin) may do this."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shift updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid shift data"),
            @ApiResponse(responseCode = "403", description = "Access denied — not the event owner"),
            @ApiResponse(responseCode = "404", description = "Event or shift not found")
    })
    public ShiftResponse update(
            @PathVariable Long eventId,
            @PathVariable Long shiftId,
            @Valid @RequestBody UpdateShiftRequest req,
            Authentication authentication
    ) {
        var shift = service.update(eventId, shiftId, req, authentication);
        return toResponse(shift.getId(), shift.getRole(), shift.getLocation(),
                shift.getStartTime(), shift.getEndTime(), shift.getHeadcount());
    }

    /** Event overview list */
    @GetMapping
    @Operation(
            summary = "Get shifts for an event",
            description = "Returns all shifts belonging to the specified event"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of shifts returned"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public List<ShiftResponse> list(@PathVariable Long eventId) {
        return repo.findByEventId(eventId).stream()
                .map(s -> toResponse(s.getId(), s.getRole(), s.getLocation(),
                        s.getStartTime(), s.getEndTime(), s.getHeadcount()))
                .toList();
    }

    private ShiftResponse toResponse(Long id, String role, String location,
                                      java.time.LocalDateTime start, java.time.LocalDateTime end, int headcount) {
        return new ShiftResponse(id, role, location, start, end, headcount);
    }
}
