package be.ucll.se.courses.backend.config;

import be.ucll.se.courses.backend.repository.UserRepository;
import be.ucll.se.courses.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    // Separate security audit logger - goes to its own log channel
    private static final Logger securityLog = LoggerFactory.getLogger("SECURITY");

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractJwtFromCookie(request);

        if (token == null || !jwtService.isValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtService.extractEmail(token);

        userRepository.findByEmail(email).ifPresent(user -> {
            // A disabled account must lose access immediately, even with a
            // still-valid, unexpired JWT — the token is stateless, so this
            // check has to happen on every request rather than only at
            // login time. Without it, admin-disabling a user (see
            // AdminController) would have no real effect until their token
            // expired on its own.
            if (!user.isEnabled()) {
                securityLog.warn("Rejected request - reason=account_disabled email={}", email);
                return;
            }

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            user.getAuthorities()
                    );

            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        });

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if ("JWT".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
