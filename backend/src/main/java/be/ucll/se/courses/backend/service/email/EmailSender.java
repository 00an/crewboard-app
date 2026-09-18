package be.ucll.se.courses.backend.service.email;

/**
 * Abstraction over outbound email delivery. Kept separate from
 * PasswordResetService so that *how* a reset link is delivered (or not)
 * is swappable per environment without touching business logic — and,
 * critically, so the raw reset token never has to pass through the
 * general application logger (which Filebeat ships to Elasticsearch;
 * see docker-compose.elk.yml).
 */
public interface EmailSender {
    void sendPasswordReset(String toEmail, String token);
}
