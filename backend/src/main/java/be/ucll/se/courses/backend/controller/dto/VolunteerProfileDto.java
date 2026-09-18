package be.ucll.se.courses.backend.controller.dto;

import be.ucll.se.courses.backend.unit.model.Volunteer;

public record VolunteerProfileDto(
        String name,
        String email,
        String phone
) {
    public static VolunteerProfileDto from(Volunteer v) {
        return new VolunteerProfileDto(
                v.getName(),
                v.getEmail(),
                v.getPhone()
        );
    }
}
