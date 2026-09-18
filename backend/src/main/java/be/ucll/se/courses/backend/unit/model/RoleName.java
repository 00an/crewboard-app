package be.ucll.se.courses.backend.unit.model;

import com.fasterxml.jackson.annotation.JsonValue;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Locale;

public enum RoleName {

    ADMIN,
    ORGANIZER,
    VOLUNTEER;

    public GrantedAuthority toGrantedAuthority() {
        return new SimpleGrantedAuthority("ROLE_" + name());
    }

    @Override
    @JsonValue
    public String toString() {
        return name().toLowerCase(Locale.ROOT);
    }
}
