package be.ucll.se.courses.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Binds the `cors:` block in application(-*).yaml. This is the single
 * source of truth for CORS policy — the CorsConfigurationSource bean in
 * SecurityConfig reads from this instead of hardcoding origins, so the
 * config file and the enforced policy can never drift apart.
 */
@ConfigurationProperties(prefix = "cors")
public class CorsProperties {

    private List<String> allowedOrigins = List.of();
    private List<String> allowedMethods = List.of();
    private List<String> allowedHeaders = List.of();
    private boolean allowCredentials;

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public List<String> getAllowedMethods() {
        return allowedMethods;
    }

    public void setAllowedMethods(List<String> allowedMethods) {
        this.allowedMethods = allowedMethods;
    }

    public List<String> getAllowedHeaders() {
        return allowedHeaders;
    }

    public void setAllowedHeaders(List<String> allowedHeaders) {
        this.allowedHeaders = allowedHeaders;
    }

    public boolean isAllowCredentials() {
        return allowCredentials;
    }

    public void setAllowCredentials(boolean allowCredentials) {
        this.allowCredentials = allowCredentials;
    }
}
