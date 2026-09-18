package be.ucll.se.courses.backend.unit.service;

import be.ucll.se.courses.backend.controller.dto.ShiftAvailabilityDto;
import be.ucll.se.courses.backend.repository.*;
import be.ucll.se.courses.backend.service.AvailabilityService;
import be.ucll.se.courses.backend.unit.model.Availability;
import be.ucll.se.courses.backend.unit.model.Shift;
import be.ucll.se.courses.backend.unit.model.Volunteer;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    private AvailabilityRepository availabilityRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private VolunteerRepository volunteerRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    @Test
    void getForEvent_returnsShiftAvailabilityDtos() {
        // GIVEN
        String username = "john_doe";
        Long eventId = 1L;

        Volunteer volunteer = mock(Volunteer.class);
        when(volunteer.getId()).thenReturn(10L);

        Shift shift1 = mock(Shift.class);
        when(shift1.getId()).thenReturn(1L);
        when(shift1.getRole()).thenReturn("Volunteer");
        when(shift1.getStartTime()).thenReturn(LocalDateTime.now());
        when(shift1.getEndTime()).thenReturn(LocalDateTime.now().plusHours(2));

        Shift shift2 = mock(Shift.class);
        when(shift2.getId()).thenReturn(2L);
        when(shift2.getRole()).thenReturn("Supervisor");
        when(shift2.getStartTime()).thenReturn(LocalDateTime.now());
        when(shift2.getEndTime()).thenReturn(LocalDateTime.now().plusHours(3));

        Availability availability = mock(Availability.class);
        when(availability.getShift()).thenReturn(shift1);

        when(volunteerRepository.findByUserUsername(username))
                .thenReturn(Optional.of(volunteer));

        when(availabilityRepository.findByVolunteerId(10L))
                .thenReturn(List.of(availability));

        when(shiftRepository.findByEventId(eventId))
                .thenReturn(List.of(shift1, shift2));

        // WHEN
        List<ShiftAvailabilityDto> result =
                availabilityService.getForEvent(username, eventId);

        // THEN
        assertEquals(2, result.size());

        ShiftAvailabilityDto first = result.get(0);
        ShiftAvailabilityDto second = result.get(1);

        assertTrue(first.available());
        assertFalse(second.available());
    }

    @Test
    void save_deletesOldAndSavesNewAvailabilities() {
        // GIVEN
        String username = "john_doe";
        Set<Long> shiftIds = Set.of(1L, 2L);

        Volunteer volunteer = mock(Volunteer.class);
        when(volunteer.getId()).thenReturn(10L);

        Shift shift1 = mock(Shift.class);
        Shift shift2 = mock(Shift.class);

        when(volunteerRepository.findByUserUsername(username))
                .thenReturn(Optional.of(volunteer));

        when(shiftRepository.findById(1L))
                .thenReturn(Optional.of(shift1));
        when(shiftRepository.findById(2L))
                .thenReturn(Optional.of(shift2));

        // WHEN
        availabilityService.save(username, shiftIds);

        // THEN
        verify(availabilityRepository).deleteByVolunteer_Id(10L);
        verify(availabilityRepository, times(2))
                .save(any(Availability.class));
    }
}
