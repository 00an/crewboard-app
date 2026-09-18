package be.ucll.se.courses.backend.service.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Dev-only stand-in for a real mail provider. Prints the reset token to
 * the console at DEBUG level so a local run can be demoed end-to-end
 * without SMTP — never active outside the "dev" profile, and never
 * written through a logger whose output is shipped anywhere.
 */
@Service
@Profile("dev")
public class ConsoleEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleEmailSender.class);

    @Override
    public void sendPasswordReset(String toEmail, String token) {
        log.debug("[DEV ONLY] Password reset link for {}: /reset-password?token={}", toEmail, token);
    }
}
