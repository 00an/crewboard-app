package be.ucll.se.courses.backend.unit.service;

import be.ucll.se.courses.backend.controller.dto.RegisterRequest;
import be.ucll.se.courses.backend.repository.RoleRepository;
import be.ucll.se.courses.backend.repository.UserRepository;
import be.ucll.se.courses.backend.repository.VolunteerRepository;
import be.ucll.se.courses.backend.service.PasswordPolicyService;
import be.ucll.se.courses.backend.service.RegistrationService;
import be.ucll.se.courses.backend.unit.model.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VolunteerRepository volunteerRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PasswordPolicyService passwordPolicyService;

    @InjectMocks
    private RegistrationService registrationService;

    @Test
    void register_createsUserAndVolunteer_whenInputIsValid() {
        // GIVEN
        RegisterRequest request = new RegisterRequest(
                "John",
                "Doe",
                "john.doe@example.com",
                "SecureP@ssw0rd1"
        );

        Role volunteerRole = new Role(RoleName.VOLUNTEER);

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(volunteerRepository.existsByEmail(request.email())).thenReturn(false);
        when(roleRepository.findByName(RoleName.VOLUNTEER))
                .thenReturn(Optional.of(volunteerRole));
        when(passwordEncoder.encode(request.password()))
                .thenReturn("encoded-password");

        // WHEN
        registrationService.register(request);

        // THEN
        verify(userRepository).save(any(User.class));
        verify(volunteerRepository).save(any(Volunteer.class));
    }
}
