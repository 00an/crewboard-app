package be.ucll.se.courses.backend.unit.model;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private boolean enabled = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    protected User() {}

    public User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    // ===== getters =====

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getEmail() { return email; }

    public boolean isEnabled() {
        return enabled;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    // ===== domain behavior =====

    public void addRole(Role role) {
        roles.add(role);
    }

    public void setPassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Set<GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(r -> r.getName().toGrantedAuthority())
                .collect(Collectors.toSet());
    }
}
