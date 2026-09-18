package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.controller.dto.LoginRequest;
import be.ucll.se.courses.backend.repository.UserRepository;
import be.ucll.se.courses.backend.unit.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    // General application logger
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    // Separate security audit logger - goes to its own log channel
    private static final Logger securityLog = LoggerFactory.getLogger("SECURITY");

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final PasswordPolicyService passwordPolicy;

    // Pre-computed dummy hash used when the email is not found.
    // Running BCrypt on the dummy prevents a timing oracle where an attacker
    // can distinguish "user not found" (fast) from "wrong password" (slow BCrypt).
    private final String dummyHash;

    public AuthService(
            UserRepository users,
            PasswordEncoder encoder,
            JwtService jwt,
            PasswordPolicyService passwordPolicy
    ) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.passwordPolicy = passwordPolicy;
        // Encode once at startup so we don't pay the BCrypt cost on every unknown-email request
        this.dummyHash = encoder.encode("timing-prevention-dummy-value-x7!");
    }

    // Authenticates a user and returns a JWT token on success.
    public String login(LoginRequest req) {
        String email = req.username();

        User user = users.findByEmail(email).orElse(null);

        if (user == null) {
            // Always run BCrypt even for unknown emails to equalise response time
            encoder.matches(req.getPassword(), dummyHash);
            securityLog.warn("Login failed - reason=user_not_found email={}", email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            securityLog.warn("Login failed - reason=wrong_password email={}", email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (!user.isEnabled()) {
            // Deliberately the same generic message as invalid credentials —
            // a distinct "account disabled" response would let an attacker
            // enumerate which accounts exist and are disabled.
            securityLog.warn("Login failed - reason=account_disabled email={}", email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        securityLog.info("Login success - email={}", email);
        log.info("User logged in - email={}", email);

        return jwt.generateToken(user.getEmail());
    }

    /**
     * Changes a user's password after verifying their current password.
     * The new password is validated against the password policy before saving.
     */
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Verify the user actually knows their current password before allowing a change
        if (!encoder.matches(currentPassword, user.getPassword())) {
            securityLog.warn("Password change failed - reason=wrong_current_password email={}", email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        // Enforce password rules (length, complexity, etc.)
        passwordPolicy.validate(newPassword);

        user.setPassword(encoder.encode(newPassword));
        users.save(user);

        securityLog.info("Password changed - email={}", email);
        log.info("User changed password - email={}", email);
    }
}
