package be.ucll.se.courses.backend.controller.dto;

import be.ucll.se.courses.backend.unit.model.Volunteer;

public record VolunteerDto(
        Long id,
        String name,
        String email
) {
    public static VolunteerDto from(Volunteer v) {
        return new VolunteerDto(
                v.getId(),
                v.getName(),
                v.getEmail()
        );
    }
}
