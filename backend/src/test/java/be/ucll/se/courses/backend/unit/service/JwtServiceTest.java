package be.ucll.se.courses.backend.unit.service;

import be.ucll.se.courses.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET =
            "this-is-a-very-secure-test-secret-key-which-is-long-enough";
    private static final long EXPIRATION = 60_000; // 1 minute

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, EXPIRATION);
    }

    @Test
    void generateToken_createsValidJwt() {
        // GIVEN
        String email = "john.doe@example.com";

        // WHEN
        String token = jwtService.generateToken(email);

        // THEN
        assertNotNull(token);
        assertTrue(jwtService.isValid(token));
    }

    @Test
    void extractEmail_returnsEmailFromToken() {
        // GIVEN
        String email = "john.doe@example.com";
        String token = jwtService.generateToken(email);

        // WHEN
        String extractedEmail = jwtService.extractEmail(token);

        // THEN
        assertEquals(email, extractedEmail);
    }
}
