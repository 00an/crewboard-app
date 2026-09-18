package be.ucll.se.courses.backend.unit.model;

import jakarta.persistence.*;

@Entity
@Table(name = "volunteer")
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    protected Volunteer() {}

    public Volunteer(User user, String name, String email) {
        this.user = user;
        this.name = name;
        changeEmail(email);
    }

    // ===== domain rules =====

    private void changeEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }
        this.email = email;
    }

    public void updatePhone(String phone) {
        this.phone = phone;
    }

    // ===== getters =====

    public Long getId() { return id; }

    public User getUser() { return user; }

    public String getName() { return name; }

    public String getEmail() { return email; }

    public String getPhone() { return phone; }
}
