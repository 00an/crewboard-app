package be.ucll.se.courses.backend.controller.dto;

import be.ucll.se.courses.backend.unit.model.User;

import java.util.Set;
import java.util.stream.Collectors;

public record UserSummaryDto(Long id, String email, String username, boolean enabled, Set<String> roles) {

    public static UserSummaryDto from(User u) {
        Set<String> roleNames = u.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());
        return new UserSummaryDto(u.getId(), u.getEmail(), u.getUsername(), u.isEnabled(), roleNames);
    }
}
