package be.ucll.se.courses.backend.service.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Default (non-dev) email sender: no SMTP integration is wired up yet, so
 * this fails safe — it never logs or otherwise exposes the reset token —
 * and just records that a reset was requested but not delivered. Wire a
 * real provider (SES, SendGrid, etc.) here before deploying this for real.
 */
@Service
@Profile("!dev")
public class NoOpEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(NoOpEmailSender.class);

    @Override
    public void sendPasswordReset(String toEmail, String token) {
        log.warn("Password reset requested but no EmailSender is configured — " +
                "the token was generated and stored, but not delivered. " +
                "Wire a real EmailSender bean before relying on this in production.");
    }
}
