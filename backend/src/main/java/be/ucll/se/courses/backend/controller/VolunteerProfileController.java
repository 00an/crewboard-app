package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.UpdateVolunteerProfileRequest;
import be.ucll.se.courses.backend.controller.dto.VolunteerProfileDto;
import be.ucll.se.courses.backend.service.VolunteerProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteer/profile")
@Tag(
        name = "Volunteer Profile",
        description = "Endpoints for viewing and updating the volunteer profile"
)
public class VolunteerProfileController {

    private final VolunteerProfileService service;

    public VolunteerProfileController(VolunteerProfileService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(
            summary = "Get my volunteer profile",
            description = "Returns the profile information of the currently authenticated volunteer"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Volunteer profile returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    public VolunteerProfileDto me(Authentication auth) {
        return VolunteerProfileDto.from(
                service.getProfile(auth.getName())
        );
    }

    @PutMapping
    @Operation(
            summary = "Update volunteer profile",
            description = "Updates editable profile fields of the currently authenticated volunteer"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid profile data"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Volunteer not found")
    })
    public void update(
            Authentication auth,
            @Valid @RequestBody UpdateVolunteerProfileRequest request
    ) {
        service.updateProfile(auth.getName(), request.phone());
    }
}
