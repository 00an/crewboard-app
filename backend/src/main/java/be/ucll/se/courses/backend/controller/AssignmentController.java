package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.AssignVolunteerRequest;
import be.ucll.se.courses.backend.controller.dto.VolunteerDto;
import be.ucll.se.courses.backend.service.AssignmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
@Tag(
        name = "Assignments",
        description = "Endpoints for assigning volunteers to shifts"
)
public class AssignmentController {

    private final AssignmentService service;

    public AssignmentController(AssignmentService service) {
        this.service = service;
    }

    @GetMapping("/shift/{shiftId}/available-volunteers")
    @Operation(
            summary = "Get available volunteers for a shift",
            description = "Returns all volunteers who have indicated availability for the given shift"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of available volunteers"),
            @ApiResponse(responseCode = "404", description = "Shift not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    public List<VolunteerDto> availableVolunteers(
            @PathVariable Long shiftId,
            Authentication authentication
    ) {
        return service.getAvailableVolunteers(shiftId, authentication).stream()
                .map(VolunteerDto::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Assign a volunteer to a shift",
            description = "Assigns a volunteer to a shift if the volunteer is available and the shift is not full"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Volunteer successfully assigned"),
            @ApiResponse(responseCode = "400", description = "Volunteer not available or shift full"),
            @ApiResponse(responseCode = "404", description = "Shift or volunteer not found"),
            @ApiResponse(responseCode = "409", description = "Volunteer already assigned"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    public void assignVolunteer(
            @Valid @RequestBody AssignVolunteerRequest request,
            Authentication authentication
    ) {
        service.assignVolunteer(
                request.shiftId(),
                request.volunteerId(),
                authentication
        );
    }
}
