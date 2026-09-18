package be.ucll.se.courses.backend.unit.service;

import be.ucll.se.courses.backend.repository.*;
import be.ucll.se.courses.backend.service.AssignmentService;
import be.ucll.se.courses.backend.unit.model.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private AvailabilityRepository availabilityRepository;

    @Mock
    private VolunteerRepository volunteerRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @InjectMocks
    private AssignmentService assignmentService;

    /** Returns an Authentication mock that has ROLE_ADMIN, bypassing ownership checks. */
    @SuppressWarnings("unchecked")
    private Authentication adminAuth() {
        Authentication auth = mock(Authentication.class);
        GrantedAuthority adminAuthority = () -> "ROLE_ADMIN";
        when(auth.getAuthorities()).thenReturn((Collection) List.of(adminAuthority));
        return auth;
    }

    @Test
    void getAvailableVolunteers_returnsVolunteers_whenShiftExists() {
        // GIVEN
        Long shiftId = 1L;

        Shift shift = mock(Shift.class);
        Volunteer volunteer = mock(Volunteer.class);

        when(shiftRepository.findById(shiftId))
                .thenReturn(Optional.of(shift));

        when(availabilityRepository.findVolunteersByShiftId(shiftId))
                .thenReturn(List.of(volunteer));

        // WHEN
        List<Volunteer> result =
                assignmentService.getAvailableVolunteers(shiftId, adminAuth());

        // THEN
        assertEquals(1, result.size());
        verify(availabilityRepository).findVolunteersByShiftId(shiftId);
    }

    @Test
    void assignVolunteer_savesAssignment_whenAllConditionsAreMet() {
        // GIVEN
        Long shiftId = 1L;
        Long volunteerId = 2L;

        Shift shift = mock(Shift.class);
        when(shift.getHeadcount()).thenReturn(5);

        Volunteer volunteer = mock(Volunteer.class);

        when(shiftRepository.findById(shiftId))
                .thenReturn(Optional.of(shift));
        when(volunteerRepository.findById(volunteerId))
                .thenReturn(Optional.of(volunteer));

        when(availabilityRepository.existsByVolunteerIdAndShiftId(volunteerId, shiftId))
                .thenReturn(true);
        when(assignmentRepository.existsByVolunteerIdAndShiftId(volunteerId, shiftId))
                .thenReturn(false);
        when(assignmentRepository.countByShiftId(shiftId))
                .thenReturn(0L);

        // WHEN
        assignmentService.assignVolunteer(shiftId, volunteerId, adminAuth());

        // THEN
        verify(assignmentRepository).save(any(Assignment.class));
    }

    @Test
    void getMyAssignments_returnsAssignmentsForVolunteer() {
        // GIVEN
        String username = "john_doe";

        Volunteer volunteer = mock(Volunteer.class);
        when(volunteer.getId()).thenReturn(10L);

        Assignment assignment = mock(Assignment.class);

        when(volunteerRepository.findByUserUsername(username))
                .thenReturn(Optional.of(volunteer));
        when(assignmentRepository.findByVolunteerId(10L))
                .thenReturn(List.of(assignment));

        // WHEN
        List<Assignment> result =
                assignmentService.getMyAssignments(username);

        // THEN
        assertEquals(1, result.size());
        verify(assignmentRepository).findByVolunteerId(10L);
    }
}
