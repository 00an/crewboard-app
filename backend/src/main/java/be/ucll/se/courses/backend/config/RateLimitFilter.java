package be.ucll.se.courses.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sliding-window rate limiter applied to sensitive auth endpoints.
 * Protects against brute-force and credential stuffing by limiting
 * requests per source IP to MAX_REQUESTS within WINDOW_MS.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000; // 1 minute sliding window

    private static final Set<String> RATE_LIMITED_PATHS = Set.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/forgot-password",
            "/api/auth/reset-password"
    );

    // Only honour X-Forwarded-For when the app is actually deployed behind
    // a trusted reverse proxy that sets/overwrites this header itself.
    // Trusting it unconditionally lets a client set an arbitrary
    // X-Forwarded-For value on every request and bypass this limiter
    // entirely by "rotating" IPs. Off by default; see application.yaml.
    @Value("${app.security.trust-proxy-headers:false}")
    private boolean trustProxyHeaders;

    private final Map<String, Queue<Long>> requestLog = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        if (!RATE_LIMITED_PATHS.contains(path)) {
            chain.doFilter(request, response);
            return;
        }

        String ip = resolveClientIp(request);
        long now = System.currentTimeMillis();

        Queue<Long> timestamps = requestLog.computeIfAbsent(ip, k -> new LinkedList<>());

        synchronized (timestamps) {
            // Evict timestamps outside the current sliding window
            while (!timestamps.isEmpty() && now - timestamps.peek() > WINDOW_MS) {
                timestamps.poll();
            }

            if (timestamps.size() >= MAX_REQUESTS) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Too many requests. Try again in a minute.\"}");
                return;
            }

            timestamps.add(now);
        }

        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (trustProxyHeaders) {
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                // First IP in XFF is the originating client
                return xff.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    /**
     * Prevents the request log from growing without bound: an IP that
     * stops sending requests would otherwise keep an empty (or stale)
     * queue in memory forever. Runs every 10 minutes.
     */
    @Scheduled(fixedRate = 10 * 60 * 1000)
    void evictStaleEntries() {
        long now = System.currentTimeMillis();
        requestLog.forEach((ip, timestamps) -> {
            synchronized (timestamps) {
                while (!timestamps.isEmpty() && now - timestamps.peek() > WINDOW_MS) {
                    timestamps.poll();
                }
                if (timestamps.isEmpty()) {
                    requestLog.remove(ip, timestamps);
                }
            }
        });
    }
}
