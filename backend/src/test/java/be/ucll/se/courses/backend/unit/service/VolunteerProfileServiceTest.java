package be.ucll.se.courses.backend.unit.service;

import be.ucll.se.courses.backend.repository.VolunteerRepository;
import be.ucll.se.courses.backend.service.VolunteerProfileService;
import be.ucll.se.courses.backend.unit.model.Volunteer;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VolunteerProfileServiceTest {

    @Mock
    private VolunteerRepository volunteerRepository;

    @InjectMocks
    private VolunteerProfileService volunteerProfileService;

    @Test
    void getProfile_returnsVolunteer_whenVolunteerExists() {
        // GIVEN
        String username = "john_doe";
        Volunteer volunteer = mock(Volunteer.class);

        when(volunteerRepository.findByUserUsername(username))
                .thenReturn(Optional.of(volunteer));

        // WHEN
        Volunteer result = volunteerProfileService.getProfile(username);

        // THEN
        assertEquals(volunteer, result);
        verify(volunteerRepository).findByUserUsername(username);
    }

    @Test
    void updateProfile_updatesPhoneAndSavesVolunteer() {
        // GIVEN
        String username = "john_doe";
        String phone = "0123456789";
        Volunteer volunteer = mock(Volunteer.class);

        when(volunteerRepository.findByUserUsername(username))
                .thenReturn(Optional.of(volunteer));

        // WHEN
        volunteerProfileService.updateProfile(username, phone);

        // THEN
        verify(volunteer).updatePhone(phone);
        verify(volunteerRepository).save(volunteer);
    }
}
