# Backend

Spring Boot 3 / Java 21 REST API for CrewBoard.

## Requirements

- JDK 21
- Maven

## Running

The app has two modes, selected by the `dev` Spring profile.

### Local development (recommended for trying the app out)

```bash
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
```

This mode:

- Uses an embedded H2 in-memory database (no external database needed)
- Seeds demo accounts, events, and shifts on startup (see the console output for credentials, or the root [README](../README.md))
- Falls back to a placeholder JWT signing key if `JWT_SECRET` isn't set
- Allows the auth cookie over plain HTTP (`Secure` flag off)
- Exposes the H2 console, actuator, and Swagger UI

### Default (production-strict) mode

```bash
mvn spring-boot:run
```

With no profile active, the app is intentionally strict:

- `JWT_SECRET` **must** be set as an environment variable — the app fails to start otherwise, rather than silently signing tokens with a known key
- No demo data is seeded
- The auth cookie requires HTTPS (`Secure` flag on)
- Dev-only endpoints (H2 console, actuator, Swagger UI) are closed

To point this mode at a real database instead of the default embedded H2, set the standard Spring datasource properties (e.g. via environment variables or a local, git-ignored `application.yaml` in this folder):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://<host>:<port>/<database>
    username: <db-username>
    password: <db-password>
```

## Tests

```bash
mvn test
```

Integration tests that rely on seeded fixture data activate the `dev` profile themselves via `@ActiveProfiles("dev")`.
