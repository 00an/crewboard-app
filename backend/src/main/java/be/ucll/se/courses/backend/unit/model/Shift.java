package be.ucll.se.courses.backend.unit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shift")
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String role;

    private String location;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private int headcount;

    @ManyToOne
    @JoinColumn(name = "leader_volunteer_id")
    private Volunteer leader;

    protected Shift() {}

    public Shift(Event event, String role, LocalDateTime start, LocalDateTime end, int headcount) {
        if (headcount <= 0) {
            throw new IllegalArgumentException("Headcount must be positive");
        }
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        this.event = event;
        this.role = role;
        this.startTime = start;
        this.endTime = end;
        this.headcount = headcount;
    }

    // Getters & setters

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public int getHeadcount() {
        return headcount;
    }

    public void setHeadcount(int headcount) {
        this.headcount = headcount;
    }

    public Volunteer getLeader() {
        return leader;
    }

    public void setLeader(Volunteer leader) {
        this.leader = leader;
    }
}
