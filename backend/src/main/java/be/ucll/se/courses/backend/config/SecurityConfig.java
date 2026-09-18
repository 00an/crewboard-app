package be.ucll.se.courses.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.*;


@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(CorsProperties.class)
public class SecurityConfig {

    // Dev-only endpoints (H2 console, actuator, OpenAPI/Swagger UI) are only
    // ever reachable when explicitly opened via the "dev" profile — see
    // application-dev.yaml. In every other environment they simply fall
    // through to the authenticated-only fallback rule below.
    @Value("${app.security.dev-tools-enabled:false}")
    private boolean devToolsEnabled;

    private static final String[] DEV_TOOL_PATHS = {
            "/h2-console/**",
            "/actuator/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    // Password Storage
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthFilter jwtFilter,
            RateLimitFilter rateLimitFilter,
            AuthenticationEntryPoint entryPoint
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                // CSRF is disabled because this API is stateless (JWT in an
                // httpOnly cookie, no server-side session) and the cookie is
                // issued with SameSite=Strict (see AuthController) plus a
                // strict, explicit CORS allow-list below. Together those two
                // controls mean the browser will not attach the auth cookie
                // to a cross-site request in the first place, which is the
                // condition CSRF tokens exist to prevent. See SECURITY.md.
                .cors(Customizer.withDefaults())
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                /* ── Security headers ─────────────────────────────────── */
                .headers(h -> h
                        // X-Frame-Options: DENY prevents clickjacking
                        .frameOptions(fo -> fo.deny())
                        // X-Content-Type-Options: nosniff prevents MIME sniffing
                        .contentTypeOptions(Customizer.withDefaults())
                        // Referrer-Policy limits information leakage in Referer header
                        .referrerPolicy(rp -> rp.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        // Minimal CSP: only allow resources from same origin.
                        // (This only covers API responses — the frontend sets
                        // its own CSP for the pages it serves; see next.config.js.)
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; frame-ancestors 'none'"))
                )

                /* ── Route authorization ──────────────────────────────── */
                .authorizeHttpRequests(auth -> {

                        // AUTH - PUBLIC
                        auth.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/auth/me").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()

                        /* AUTH — requires login */
                        .requestMatchers(HttpMethod.POST, "/api/auth/change-password").authenticated()

                        /* CORS preflight */
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        /* ADMIN — admin role only */
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        /* EVENTS */
                        .requestMatchers(HttpMethod.POST, "/api/events").hasAnyRole("ORGANIZER", "ADMIN")
                        .requestMatchers(HttpMethod.GET,  "/api/events").authenticated()

                        /* SHIFTS */
                        .requestMatchers(HttpMethod.POST,  "/api/events/*/shifts").hasAnyRole("ORGANIZER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/events/*/shifts/*").hasAnyRole("ORGANIZER", "ADMIN")
                        .requestMatchers(HttpMethod.GET,   "/api/events/*/shifts/**").authenticated()

                        /* VOLUNTEER SELF-SERVICE — profile, availability, dashboard, assignments */
                        .requestMatchers("/api/volunteer/**").hasRole("VOLUNTEER")

                        /* ASSIGNMENTS */
                        .requestMatchers(HttpMethod.GET,  "/api/assignments/shift/*/available-volunteers")
                        .hasAnyRole("ORGANIZER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/assignments")
                        .hasAnyRole("ORGANIZER", "ADMIN")

                        /* URL VALIDATION (SSRF check) — any authenticated user */
                        .requestMatchers(HttpMethod.POST, "/api/url-validate").authenticated();

                        /* DEV TOOLS — only ever open when the "dev" profile enables them */
                        if (devToolsEnabled) {
                            auth.requestMatchers(DEV_TOOL_PATHS).permitAll();
                        }

                        /* FALLBACK */
                        auth.anyRequest().authenticated();
                })

                .exceptionHandling(e -> e.authenticationEntryPoint(entryPoint))
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS configuration for frontend communication — driven entirely by
    // CorsProperties (bound from the `cors:` block in application*.yaml),
    // so there is exactly one place that defines the allowed origins.
    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties props) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(props.getAllowedOrigins());
        cfg.setAllowedMethods(props.getAllowedMethods());
        cfg.setAllowedHeaders(props.getAllowedHeaders());
        cfg.setAllowCredentials(props.isAllowCredentials());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    // handles unauthorized access responses (401)
    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, ex) -> {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Unauthorized\"}");
        };
    }
}
