package be.ucll.se.courses.backend.unit.service;

import be.ucll.se.courses.backend.controller.dto.LoginRequest;
import be.ucll.se.courses.backend.repository.UserRepository;
import be.ucll.se.courses.backend.service.AuthService;
import be.ucll.se.courses.backend.service.JwtService;
import be.ucll.se.courses.backend.unit.model.User;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_returnsJwtToken_whenCredentialsAreValid() {
        // GIVEN
        String email = "john.doe@example.com";
        String rawPassword = "password123";
        String encodedPassword = "encoded-password";
        String jwtToken = "jwt-token";

        LoginRequest request = mock(LoginRequest.class);
        when(request.username()).thenReturn(email);
        when(request.getPassword()).thenReturn(rawPassword);

        User user = mock(User.class);
        when(user.getEmail()).thenReturn(email);
        when(user.getPassword()).thenReturn(encodedPassword);
        when(user.isEnabled()).thenReturn(true);

        when(userRepository.findByEmail(email))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, encodedPassword))
                .thenReturn(true);
        when(jwtService.generateToken(email))
                .thenReturn(jwtToken);

        // WHEN
        String result = authService.login(request);

        // THEN
        assertEquals(jwtToken, result);

        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).matches(rawPassword, encodedPassword);
        verify(jwtService).generateToken(email);
    }
}
