package be.ucll.se.courses.backend.controller;

import be.ucll.se.courses.backend.controller.dto.*;
import be.ucll.se.courses.backend.repository.UserRepository;
import be.ucll.se.courses.backend.service.AuthService;
import be.ucll.se.courses.backend.service.PasswordResetService;
import be.ucll.se.courses.backend.service.RegistrationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and registration endpoints")
public class AuthController {

    private final AuthService auth;
    private final UserRepository users;
    private final RegistrationService registrationService;
    private final PasswordResetService passwordResetService;
    private final long jwtExpirationMillis;
    private final boolean cookieSecure;

    public AuthController(
            AuthService auth,
            UserRepository users,
            RegistrationService registrationService,
            PasswordResetService passwordResetService,
            @Value("${app.jwt.expirationMillis}") long jwtExpirationMillis,
            @Value("${app.security.cookie-secure:true}") boolean cookieSecure
    ) {
        this.auth = auth;
        this.users = users;
        this.registrationService = registrationService;
        this.passwordResetService = passwordResetService;
        this.jwtExpirationMillis = jwtExpirationMillis;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates a user and sets a JWT cookie on success")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    public ResponseEntity<Void> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        String token = auth.login(request);

        ResponseCookie cookie = ResponseCookie.from("JWT", token)
                .httpOnly(true)
                .secure(cookieSecure) // true by default; only the dev profile relaxes this
                .sameSite("Strict")
                .path("/")
                .maxAge(jwtExpirationMillis / 1000)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Clears the JWT cookie")
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Logout successful")})
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie.from("JWT", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", deleteCookie.toString());
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User info returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<AuthMeResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        List<String> roles = authentication.getAuthorities()
                .stream()
                .map(a -> a.getAuthority())
                .map(r -> r.startsWith("ROLE_") ? r.substring(5) : r)
                .toList();

        String role =
                roles.contains("ADMIN")     ? "ADMIN" :
                        roles.contains("ORGANIZER") ? "ORGANIZER" :
                                roles.contains("VOLUNTEER") ? "VOLUNTEER" : null;

        return ResponseEntity.ok(new AuthMeResponse(email, role, roles));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new volunteer")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Registration successful"),
            @ApiResponse(responseCode = "400", description = "Invalid data or weak password"),
            @ApiResponse(responseCode = "409", description = "Email already in use"),
            @ApiResponse(responseCode = "429", description = "Too many requests")
    })
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        registrationService.register(request);
    }

    @PostMapping("/forgot-password")
    @Operation(
            summary = "Request password reset",
            description = "Sends a reset token to the email address. Always returns 204 to prevent user enumeration."
    )
    @ApiResponses({@ApiResponse(responseCode = "204", description = "Reset email sent if account exists")})
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiateReset(request.email());
    }

    @PostMapping("/reset-password")
    @Operation(
            summary = "Reset password using token",
            description = "Validates the reset token and updates the password"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Password reset successful"),
            @ApiResponse(responseCode = "400", description = "Invalid/expired token or weak password")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
    }

    @PostMapping("/change-password")
    @Operation(
            summary = "Change password (authenticated)",
            description = "Verifies current password then sets new password. Requires authentication."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Password changed"),
            @ApiResponse(responseCode = "400", description = "Weak new password"),
            @ApiResponse(responseCode = "401", description = "Current password incorrect or not authenticated")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        auth.changePassword(authentication.getName(), request.currentPassword(), request.newPassword());
    }
}
