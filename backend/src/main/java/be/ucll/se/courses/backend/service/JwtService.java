package be.ucll.se.courses.backend.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final Key key;
    private final long expirationMillis;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expirationMillis}") long expirationMillis
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expirationMillis;
    }

    /**
     * Subject = email
     */
    public String generateToken(String email) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMillis))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Subject = email
     */
    public String extractEmail(String token) {
        return parse(token).getBody().getSubject();
    }

    // Optional helper if you still need it elsewhere
    public String extractTokenFromRequest(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (var cookie : request.getCookies()) {
            if ("JWT".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
}
