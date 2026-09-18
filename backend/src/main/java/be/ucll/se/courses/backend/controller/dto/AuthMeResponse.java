package be.ucll.se.courses.backend.controller.dto;

import java.util.List;

public class AuthMeResponse {

    private final String email;

    // single role your frontend expects: "ADMIN" | "ORGANIZER" | "VOLUNTEER"
    private final String role;

    // keep list too (useful for debugging / future)
    private final List<String> roles;

    public AuthMeResponse(String email, String role, List<String> roles) {
        this.email = email;
        this.role = role;
        this.roles = roles;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public List<String> getRoles() {
        return roles;
    }
}
