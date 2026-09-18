package be.ucll.se.courses.backend.unit.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "availability")
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "volunteer_id")
    private Volunteer volunteer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    protected Availability() {
        // JPA only
    }

    public Availability(Volunteer volunteer, Shift shift) {
        this.volunteer = volunteer;
        this.shift = shift;
    }

    public Long getId() {
        return id;
    }

    public Volunteer getVolunteer() {
        return volunteer;
    }

    public Shift getShift() {
        return shift;
    }
}
