package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.repository.PasswordResetTokenRepository;
import be.ucll.se.courses.backend.repository.UserRepository;
import be.ucll.se.courses.backend.service.email.EmailSender;
import be.ucll.se.courses.backend.unit.model.PasswordResetToken;
import be.ucll.se.courses.backend.unit.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final long TOKEN_EXPIRY_MINUTES = 60;

    private final UserRepository userRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final PasswordEncoder encoder;
    private final PasswordPolicyService passwordPolicy;
    private final EmailSender emailSender;

    public PasswordResetService(
            UserRepository userRepo,
            PasswordResetTokenRepository tokenRepo,
            PasswordEncoder encoder,
            PasswordPolicyService passwordPolicy,
            EmailSender emailSender
    ) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.encoder = encoder;
        this.passwordPolicy = passwordPolicy;
        this.emailSender = emailSender;
    }

    /**
     * Initiates a password reset. Always returns 204 regardless of whether the email
     * exists — prevents user enumeration via this endpoint.
     */
    public void initiateReset(String email) {
        userRepo.findByEmail(email).ifPresent(user -> {
            // Invalidate any existing token for this email
            tokenRepo.deleteAllByEmail(email);

            String token = UUID.randomUUID().toString();
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);

            tokenRepo.save(new PasswordResetToken(token, email, expiry));

            // Delivery is delegated to EmailSender so the token itself never
            // has to pass through a logger whose output is centrally
            // collected (see docker-compose.elk.yml / filebeat.yml).
            emailSender.sendPasswordReset(email, token);

            log.info("Password reset requested - email={}", email);
        });
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepo.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            tokenRepo.delete(resetToken);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has expired");
        }

        passwordPolicy.validate(newPassword);

        User user = userRepo.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        user.setPassword(encoder.encode(newPassword));
        userRepo.save(user);

        tokenRepo.delete(resetToken);
    }
}
