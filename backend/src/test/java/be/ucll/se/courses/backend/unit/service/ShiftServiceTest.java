package be.ucll.se.courses.backend.unit.service;

import be.ucll.se.courses.backend.controller.dto.CreateShiftRequest;
import be.ucll.se.courses.backend.repository.EventRepository;
import be.ucll.se.courses.backend.repository.ShiftRepository;
import be.ucll.se.courses.backend.service.ShiftService;
import be.ucll.se.courses.backend.unit.model.Event;
import be.ucll.se.courses.backend.unit.model.Shift;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShiftServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @InjectMocks
    private ShiftService shiftService;

    /** Returns an Authentication mock that has ROLE_ADMIN, bypassing ownership checks. */
    @SuppressWarnings("unchecked")
    private Authentication adminAuth() {
        Authentication auth = mock(Authentication.class);
        GrantedAuthority adminAuthority = () -> "ROLE_ADMIN";
        when(auth.getAuthorities()).thenReturn((Collection) List.of(adminAuthority));
        return auth;
    }

    @Test
    void create_createsAndSavesShift_whenInputIsValid() {
        // GIVEN
        Long eventId = 1L;
        Event event = mock(Event.class);

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusHours(2);

        CreateShiftRequest request = new CreateShiftRequest(
                "Volunteer",
                "Main Hall",
                start,
                end,
                5
        );

        when(eventRepository.findById(eventId))
                .thenReturn(Optional.of(event));

        when(shiftRepository.save(any(Shift.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Shift result = shiftService.create(eventId, request, adminAuth());

        // THEN
        ArgumentCaptor<Shift> captor = ArgumentCaptor.forClass(Shift.class);
        verify(shiftRepository).save(captor.capture());

        Shift savedShift = captor.getValue();

        assertEquals(event, savedShift.getEvent());
        assertEquals("Volunteer", savedShift.getRole());
        assertEquals("Main Hall", savedShift.getLocation());
        assertEquals(start, savedShift.getStartTime());
        assertEquals(end, savedShift.getEndTime());
        assertEquals(5, savedShift.getHeadcount());

        assertEquals(savedShift, result);
    }
}
