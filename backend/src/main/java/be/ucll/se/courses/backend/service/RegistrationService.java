package be.ucll.se.courses.backend.service;

import be.ucll.se.courses.backend.controller.dto.RegisterRequest;
import be.ucll.se.courses.backend.repository.RoleRepository;
import be.ucll.se.courses.backend.repository.UserRepository;
import be.ucll.se.courses.backend.repository.VolunteerRepository;
import be.ucll.se.courses.backend.unit.model.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RegistrationService {

    private final UserRepository userRepo;
    private final VolunteerRepository volunteerRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final PasswordPolicyService passwordPolicy;

    public RegistrationService(
            UserRepository userRepo,
            VolunteerRepository volunteerRepo,
            RoleRepository roleRepo,
            PasswordEncoder encoder,
            PasswordPolicyService passwordPolicy
    ) {
        this.userRepo = userRepo;
        this.volunteerRepo = volunteerRepo;
        this.roleRepo = roleRepo;
        this.encoder = encoder;
        this.passwordPolicy = passwordPolicy;
    }

    public void register(RegisterRequest req) {

        if (req.firstName() == null || req.lastName() == null ||
                req.email() == null || req.password() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "All fields are required"
            );
        }

        passwordPolicy.validate(req.password());

        // Email must be unique across User and Volunteer
        if (userRepo.existsByEmail(req.email()) || volunteerRepo.existsByEmail(req.email())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already in use"
            );
        }

        Role volunteerRole = roleRepo.findByName(RoleName.VOLUNTEER)
                .orElseThrow(() -> new IllegalStateException("VOLUNTEER role missing"));

        // name = full name, password encoded, email stored separately
        User user = new User(
                req.firstName() + " " + req.lastName(),
                encoder.encode(req.password()),
                req.email()
        );

        user.addRole(volunteerRole);
        userRepo.save(user);

        Volunteer volunteer = new Volunteer(
                user,
                req.firstName() + " " + req.lastName(),
                req.email()
        );

        volunteerRepo.save(volunteer);
    }
}