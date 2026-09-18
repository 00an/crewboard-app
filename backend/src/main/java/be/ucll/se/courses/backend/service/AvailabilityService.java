package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.controller.dto.ShiftAvailabilityDto;
import be.ucll.se.courses.backend.repository.*;
import be.ucll.se.courses.backend.unit.model.Availability;
import be.ucll.se.courses.backend.unit.model.Shift;
import be.ucll.se.courses.backend.unit.model.Volunteer;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepo;
    private final ShiftRepository shiftRepo;
    private final VolunteerRepository volunteerRepo;

    public AvailabilityService(
            AvailabilityRepository availabilityRepo,
            ShiftRepository shiftRepo,
            VolunteerRepository volunteerRepo
    ) {
        this.availabilityRepo = availabilityRepo;
        this.shiftRepo = shiftRepo;
        this.volunteerRepo = volunteerRepo;
    }

    public java.util.List<ShiftAvailabilityDto> getForEvent(
            String username,
            Long eventId
    ) {
        Volunteer volunteer = getVolunteer(username);

        Set<Long> availableShiftIds =
                availabilityRepo.findByVolunteerId(volunteer.getId())
                        .stream()
                        .map(a -> a.getShift().getId())
                        .collect(Collectors.toSet());

        return shiftRepo.findByEventId(eventId).stream()
                .map(s -> new ShiftAvailabilityDto(
                        s.getId(),
                        s.getRole(),
                        s.getStartTime(),
                        s.getEndTime(),
                        availableShiftIds.contains(s.getId())
                ))
                .toList();
    }

    @Transactional
    public void save(
            String username,
            Set<Long> shiftIds
    ) {
        Volunteer volunteer = getVolunteer(username);

        availabilityRepo.deleteByVolunteer_Id(volunteer.getId());

        for (Long shiftId : shiftIds) {
            var shift = shiftRepo.findById(shiftId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Shift not found"));

            availabilityRepo.save(new Availability(volunteer, shift));
        }
    }
    private Volunteer getVolunteer(String username) {
        return volunteerRepo.findByUserUsername(username)
                .or(() -> volunteerRepo.findByUserEmail(username))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Volunteer not found"));
    }

    private Shift getShift(Long shiftId) {
        return shiftRepo.findById(shiftId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shift not found"));
    }

    public void dismissShift(String username, Long shiftId) {
        Volunteer v = getVolunteer(username);
        Shift s = getShift(shiftId);

        if (availabilityRepo.existsByVolunteerIdAndShiftId(v.getId(), shiftId)) {
            return; // idempotent
        }

        availabilityRepo.save(new Availability(v, s));
    }

    public void undoDismissShift(String username, Long shiftId) {
        Volunteer v = getVolunteer(username);
        availabilityRepo.deleteByVolunteerIdAndShiftId(v.getId(), shiftId);
    }

}
