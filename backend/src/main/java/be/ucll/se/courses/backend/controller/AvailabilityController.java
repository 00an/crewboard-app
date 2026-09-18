package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.SaveAvailabilityRequest;
import be.ucll.se.courses.backend.controller.dto.ShiftAvailabilityDto;
import be.ucll.se.courses.backend.service.AvailabilityService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/volunteer/availability")
@Tag(
        name = "Availability",
        description = "Volunteer availability management"
)
public class AvailabilityController {

    private final AvailabilityService service;

    public AvailabilityController(AvailabilityService service) {
        this.service = service;
    }

    @GetMapping("/events/{eventId}")
    @Operation(
            summary = "Get availability for an event",
            description = "Returns all shifts of an event with availability status for the logged-in volunteer"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Availability returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    public List<ShiftAvailabilityDto> getForEvent(
            @PathVariable Long eventId,
            Authentication authentication
    ) {
        return service.getForEvent(authentication.getName(), eventId);
    }

    @PostMapping
    @Operation(
            summary = "Save availability",
            description = "Saves the selected shift availabilities for the logged-in volunteer"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Availability saved"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Volunteer or shift not found")
    })
    public void save(
            Authentication authentication,
            @Valid @RequestBody SaveAvailabilityRequest req
    ) {
        service.save(authentication.getName(), Set.copyOf(req.shiftIds()));
    }

    @PostMapping("/{shiftId}/dismiss")
    @Operation(
            summary = "Dismiss a shift",
            description = "Marks a shift as dismissed for the logged-in volunteer"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shift dismissed"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Shift not found")
    })
    public void dismiss(
            @PathVariable Long shiftId,
            Authentication authentication
    ) {
        service.dismissShift(authentication.getName(), shiftId);
    }

    @DeleteMapping("/{shiftId}/dismiss")
    @Operation(
            summary = "Undo dismissed shift",
            description = "Removes the dismissal of a previously dismissed shift"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dismissal undone"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Shift not found")
    })
    public void undoDismiss(
            @PathVariable Long shiftId,
            Authentication authentication
    ) {
        service.undoDismissShift(authentication.getName(), shiftId);
    }
}
