package be.ucll.se.courses.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
public class PasswordPolicyService {

    private static final int MIN_LENGTH = 12;

    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "password1", "password123",
            "123456", "12345678", "1234567890",
            "qwerty", "qwerty123", "abc123",
            "admin", "admin123", "letmein",
            "welcome", "monkey", "dragon",
            "master", "sunshine", "princess",
            "iloveyou", "shadow"
    );

    public void validate(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must be at least " + MIN_LENGTH + " characters");
        }

        if (COMMON_PASSWORDS.contains(password.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password is too common or easily guessed");
        }

        if (password.chars().anyMatch(Character::isWhitespace)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must not contain whitespace");
        }

        if (password.chars().noneMatch(Character::isUpperCase)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must contain at least one uppercase letter");
        }

        if (password.chars().noneMatch(Character::isLowerCase)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must contain at least one lowercase letter");
        }

        if (password.chars().noneMatch(Character::isDigit)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must contain at least one digit");
        }

        boolean hasSpecial = password.chars()
                .anyMatch(c -> !Character.isLetterOrDigit(c) && !Character.isWhitespace(c));
        if (!hasSpecial) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must contain at least one special character");
        }
    }
}