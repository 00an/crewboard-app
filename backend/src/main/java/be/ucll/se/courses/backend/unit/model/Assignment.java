package be.ucll.se.courses.backend.unit.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment",
        uniqueConstraints = @UniqueConstraint(columnNames = {"volunteer_id", "shift_id"}))
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "volunteer_id")
    private Volunteer volunteer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status;

    private LocalDateTime assignedAt;

    private String notes;

    protected Assignment() {}

    public Assignment(Volunteer volunteer, Shift shift) {
        this.volunteer = volunteer;
        this.shift = shift;
        this.status = AssignmentStatus.CONFIRMED;
        this.assignedAt = LocalDateTime.now();
    }

    // getters only (no setters needed for now)

    public Long getId() {
        return id;
    }

    public Volunteer getVolunteer() {
        return volunteer;
    }

    public Shift getShift() {
        return shift;
    }

    public AssignmentStatus getStatus() {
        return status;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public String getNotes() {
        return notes;
    }
}
