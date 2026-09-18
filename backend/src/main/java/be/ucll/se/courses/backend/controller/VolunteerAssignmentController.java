package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.AssignedShiftDto;
import be.ucll.se.courses.backend.service.AssignmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteer")
@PreAuthorize("hasRole('VOLUNTEER')")
@Tag(
        name = "Volunteer Assignments",
        description = "Endpoints for volunteers to view their assigned shifts"
)
public class VolunteerAssignmentController {

    private final AssignmentService service;

    public VolunteerAssignmentController(AssignmentService service) {
        this.service = service;
    }

    @GetMapping("/assignments")
    @Operation(
            summary = "Get my assigned shifts",
            description = "Returns all shifts assigned to the currently authenticated volunteer"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of assigned shifts"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    public List<AssignedShiftDto> myAssignments(Authentication auth) {

        String username = auth.getName();

        return service.getMyAssignments(username).stream()
                .map(AssignedShiftDto::from)
                .toList();
    }
}
