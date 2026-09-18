package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.repository.*;
import be.ucll.se.courses.backend.unit.model.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class AssignmentService {

    private final AssignmentRepository assignmentRepo;
    private final AvailabilityRepository availabilityRepo;
    private final VolunteerRepository volunteerRepo;
    private final ShiftRepository shiftRepo;

    public AssignmentService(
            AssignmentRepository assignmentRepo,
            AvailabilityRepository availabilityRepo,
            VolunteerRepository volunteerRepo,
            ShiftRepository shiftRepo
    ) {
        this.assignmentRepo = assignmentRepo;
        this.availabilityRepo = availabilityRepo;
        this.volunteerRepo = volunteerRepo;
        this.shiftRepo = shiftRepo;
    }

    /* =========================
       STORY 4 – LIST AVAILABLE VOLUNTEERS
       ========================= */
    public List<Volunteer> getAvailableVolunteers(Long shiftId, Authentication auth) {

        Shift shift = shiftRepo.findById(shiftId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Shift not found"
                        )
                );

        verifyOrganizerOwnership(shift, auth);

        return availabilityRepo.findVolunteersByShiftId(shiftId);
    }

    /* =========================
       STORY 4 – ASSIGN VOLUNTEER
       ========================= */
    public void assignVolunteer(Long shiftId, Long volunteerId, Authentication auth) {

        Shift shift = shiftRepo.findById(shiftId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Shift not found"));

        verifyOrganizerOwnership(shift, auth);

        Volunteer volunteer = volunteerRepo.findById(volunteerId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Volunteer not found"));

        // Volunteer must be available
        if (!availabilityRepo.existsByVolunteerIdAndShiftId(volunteerId, shiftId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Volunteer is not available for this shift"
            );
        }

        // Prevent duplicate assignment
        if (assignmentRepo.existsByVolunteerIdAndShiftId(volunteerId, shiftId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Volunteer already assigned to this shift"
            );
        }

        // Capacity check
        long assignedCount = assignmentRepo.countByShiftId(shiftId);
        if (assignedCount >= shift.getHeadcount()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Shift is already full"
            );
        }

        Assignment assignment = new Assignment(volunteer, shift);
        assignmentRepo.save(assignment);
    }
    private void verifyOrganizerOwnership(Shift shift, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        String eventOrganizer = shift.getEvent().getOrganizerEmail();
        if (eventOrganizer == null || !eventOrganizer.equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    public List<Assignment> getMyAssignments(String username) {

        Volunteer volunteer = volunteerRepo.findByUserUsername(username)
                .or(() -> volunteerRepo.findByUserEmail(username))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Volunteer not found"
                ));

        return assignmentRepo.findByVolunteerId(volunteer.getId());
    }
}
