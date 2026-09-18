package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.repository.VolunteerRepository;
import be.ucll.se.courses.backend.unit.model.Volunteer;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VolunteerProfileService {

    private final VolunteerRepository volunteerRepo;

    public VolunteerProfileService(VolunteerRepository volunteerRepo) {
        this.volunteerRepo = volunteerRepo;
    }

    public Volunteer getProfile(String principal) {
        return findVolunteerByPrincipal(principal);
    }

    public void updateProfile(String principal, String phone) {
        Volunteer volunteer = findVolunteerByPrincipal(principal);
        volunteer.updatePhone(phone);
        volunteerRepo.save(volunteer);
    }

    /* =========================
       INTERNAL HELPERS
       ========================= */

    private Volunteer findVolunteerByPrincipal(String principal) {
        return volunteerRepo.findByUserUsername(principal)
                .or(() -> volunteerRepo.findByUserEmail(principal))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Volunteer not found"
                ));
    }
}
