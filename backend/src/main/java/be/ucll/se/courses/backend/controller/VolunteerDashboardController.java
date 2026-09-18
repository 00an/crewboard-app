package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.VolunteerDashboardDto;
import be.ucll.se.courses.backend.service.VolunteerDashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteer")
@Tag(
        name = "Volunteer Dashboard",
        description = "Dashboard and self-service actions for volunteers"
)
public class VolunteerDashboardController {

    private final VolunteerDashboardService service;

    public VolunteerDashboardController(VolunteerDashboardService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    @Operation(
            summary = "Get volunteer dashboard",
            description = "Returns an overview of the volunteer's assignments, availability, and upcoming shifts"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dashboard data returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    public VolunteerDashboardDto dashboard(Authentication auth) {
        return service.getDashboard(auth.getName());
    }

    @PostMapping("/shifts/{shiftId}/join")
    @Operation(
            summary = "Join a shift",
            description = "Allows the volunteer to join an available shift"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully joined shift"),
            @ApiResponse(responseCode = "400", description = "Shift is full or volunteer not eligible"),
            @ApiResponse(responseCode = "404", description = "Shift not found"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public void join(
            @PathVariable Long shiftId,
            Authentication auth
    ) {
        service.joinShift(auth.getName(), shiftId);
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @Operation(
            summary = "Leave an assigned shift",
            description = "Removes the volunteer from an assigned shift"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully left assignment"),
            @ApiResponse(responseCode = "404", description = "Assignment not found"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public void leave(
            @PathVariable Long assignmentId,
            Authentication auth
    ) {
        service.leaveAssignment(auth.getName(), assignmentId);
    }
}
