package be.ucll.se.courses.backend.controller.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank
        @JsonAlias({"identifier", "email", "username"})
        String username,   // internally we still call it username, but it will accept identifier/email too
        @NotBlank
        String password

) {
    @Override
    public String username() {
        return username;
    }

    @Override
    public String password() {
        return password;
    }

    public String getPassword() {
        return  password;
    }

    public String getUsername() {
        return username;
    }
}
