package be.ucll.se.courses.backend.unit.service;

import be.ucll.se.courses.backend.controller.dto.CreateEventRequest;
import be.ucll.se.courses.backend.repository.EventRepository;
import be.ucll.se.courses.backend.service.EventService;
import be.ucll.se.courses.backend.unit.model.Event;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventService eventService;

    @Test
    void create_createsAndSavesEvent_whenInputIsValid() {
        // GIVEN
        LocalDateTime start = LocalDateTime.of(2025, 5, 10, 9, 0);
        LocalDateTime end = LocalDateTime.of(2025, 5, 11, 18, 0);

        CreateEventRequest request = new CreateEventRequest(
                "Charity Run",
                "A charity running event",
                "City Park",
                start,
                end
        );

        when(eventRepository.save(any(Event.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        Event result = eventService.create(request, "organizer@email.com");

        // THEN
        ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository).save(captor.capture());

        Event savedEvent = captor.getValue();

        assertEquals("Charity Run", savedEvent.getTitle());
        assertEquals("A charity running event", savedEvent.getDescription());
        assertEquals("City Park", savedEvent.getLocation());
        assertEquals(start, savedEvent.getStartDate());
        assertEquals(end, savedEvent.getEndDate());

        assertEquals(savedEvent, result);
    }
}
