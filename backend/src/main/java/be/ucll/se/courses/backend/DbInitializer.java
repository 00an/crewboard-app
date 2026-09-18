package be.ucll.se.courses.backend;

import be.ucll.se.courses.backend.unit.model.*;
import be.ucll.se.courses.backend.repository.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@Profile("dev")
public class DbInitializer {

    @Bean
    CommandLineRunner init(
            UserRepository userRepo,
            RoleRepository roleRepo,
            VolunteerRepository volunteerRepo,
            EventRepository eventRepo,
            ShiftRepository shiftRepo,
            AssignmentRepository assignmentRepo,
            PasswordEncoder encoder
    ) {
        return args -> {

            LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0); // clean, seconds/nanos-free seed timestamps

            // ========== ROLES ==========
            Role adminRole = roleRepo.findByName(RoleName.ADMIN)
                    .orElseGet(() -> roleRepo.save(new Role(RoleName.ADMIN)));

            Role organizerRole = roleRepo.findByName(RoleName.ORGANIZER)
                    .orElseGet(() -> roleRepo.save(new Role(RoleName.ORGANIZER)));

            Role volunteerRole = roleRepo.findByName(RoleName.VOLUNTEER)
                    .orElseGet(() -> roleRepo.save(new Role(RoleName.VOLUNTEER)));

            // ========== USERS ==========
            User admin = userRepo.findByUsername("admin")
                    .orElseGet(() -> {
                        User u = new User("admin", encoder.encode("Admin@12345!"), "admin@email.com");
                        u.addRole(adminRole);
                        return userRepo.save(u);
                    });

            User organizer = userRepo.findByUsername("organizer")
                    .orElseGet(() -> {
                        User u = new User("organizer", encoder.encode("Organizer@12345!"), "organizer@email.com");
                        u.addRole(organizerRole);
                        return userRepo.save(u);
                    });

            User organizer2 = userRepo.findByUsername("organizer2")
                    .orElseGet(() -> {
                        User u = new User("organizer2", encoder.encode("Organizer2@12345!"), "organizer2@email.com");
                        u.addRole(organizerRole);
                        return userRepo.save(u);
                    });

            User volunteerUser = userRepo.findByUsername("volunteer")
                    .orElseGet(() -> {
                        User u = new User("volunteer", encoder.encode("Volunteer@12345!"), "volunteer@email.com");
                        u.addRole(volunteerRole);
                        return userRepo.save(u);
                    });

            // ========== VOLUNTEER PROFILE ==========
            Volunteer volunteer = volunteerRepo.findByUserId(volunteerUser.getId())
                    .orElseGet(() ->
                            volunteerRepo.save(
                                    new Volunteer(
                                            volunteerUser,
                                            "John Volunteer",
                                            "volunteer@example.com"
                                    )
                            )
                    );

            if (volunteer.getPhone() == null) {
                volunteer.updatePhone("+32 470 12 34 56");
                volunteerRepo.save(volunteer);
            }

            // ========== EVENT 1 (owned by organizer) ==========
            Event openCampus = eventRepo.findByTitle("Open Campus Day")
                    .orElseGet(() ->
                            eventRepo.save(
                                    new Event(
                                            "Open Campus Day",
                                            now.plusDays(7).withHour(9).withMinute(0),
                                            now.plusDays(7).withHour(19).withMinute(0)
                                    )
                            )
                    );

            if (openCampus.getLocation() == null) {
                openCampus.setLocation("Main Campus");
                eventRepo.save(openCampus);
            }
            if (openCampus.getOrganizerEmail() == null) {
                openCampus.setOrganizerEmail(organizer.getEmail());
                eventRepo.save(openCampus);
            }

            // ========== SHIFTS EVENT 1 ==========
            List<Shift> openCampusShifts = shiftRepo.findByEventId(openCampus.getId());

            if (openCampusShifts.isEmpty()) {

                Shift shift1 = new Shift(
                        openCampus,
                        "Registration Desk",
                        openCampus.getStartDate(),
                        openCampus.getStartDate().plusHours(2),
                        3
                );
                shift1.setLocation("Entrance");

                Shift shift2 = new Shift(
                        openCampus,
                        "Campus Tours",
                        openCampus.getStartDate().plusHours(2),
                        openCampus.getStartDate().plusHours(5),
                        4
                );
                shift2.setLocation("Meet at Info Point");

                Shift shift3 = new Shift(
                        openCampus,
                        "Information Booth",
                        openCampus.getStartDate().plusHours(5),
                        openCampus.getStartDate().plusHours(7),
                        2
                );
                shift3.setLocation("Central Plaza");

                Shift shift4 = new Shift(
                        openCampus,
                        "Cleanup",
                        openCampus.getStartDate().plusHours(7),
                        openCampus.getEndDate(),
                        2
                );
                shift4.setLocation("Storage");

                shiftRepo.saveAll(List.of(shift1, shift2, shift3, shift4));
                openCampusShifts = List.of(shift1, shift2, shift3, shift4);
            }

            // ========== EVENT 2 (owned by organizer2) ==========
            Event infoEvening = eventRepo.findByTitle("Info Evening")
                    .orElseGet(() ->
                            eventRepo.save(
                                    new Event(
                                            "Info Evening",
                                            now.plusDays(3).withHour(17).withMinute(0),
                                            now.plusDays(3).withHour(22).withMinute(0)
                                    )
                            )
                    );

            if (infoEvening.getLocation() == null) {
                infoEvening.setLocation("Hall B");
                eventRepo.save(infoEvening);
            }
            if (infoEvening.getOrganizerEmail() == null) {
                infoEvening.setOrganizerEmail(organizer2.getEmail());
                eventRepo.save(infoEvening);
            }

            // ========== SHIFTS EVENT 2 ==========
            List<Shift> infoShifts = shiftRepo.findByEventId(infoEvening.getId());

            if (infoShifts.isEmpty()) {

                Shift s1 = new Shift(
                        infoEvening,
                        "Setup",
                        infoEvening.getStartDate().minusHours(1),
                        infoEvening.getStartDate().plusHours(1),
                        2
                );
                s1.setLocation("Hall B");

                Shift s2 = new Shift(
                        infoEvening,
                        "Welcome Desk",
                        infoEvening.getStartDate(),
                        infoEvening.getStartDate().plusHours(2),
                        2
                );
                s2.setLocation("Hall B Entrance");

                Shift s3 = new Shift(
                        infoEvening,
                        "Cleanup",
                        infoEvening.getEndDate().minusHours(1),
                        infoEvening.getEndDate(),
                        3
                );
                s3.setLocation("Hall B");

                Shift past = new Shift(
                        infoEvening,
                        "Past Example Shift",
                        now.minusDays(2).withHour(18).withMinute(0),
                        now.minusDays(2).withHour(20).withMinute(0),
                        2
                );
                past.setLocation("Old Hall");

                shiftRepo.saveAll(List.of(s1, s2, s3, past));
                infoShifts = List.of(s1, s2, s3, past);
            }

            // ========== ASSIGNMENTS ==========
            if (assignmentRepo.findByVolunteerId(volunteer.getId()).isEmpty()) {
                Assignment a1 = new Assignment(volunteer, openCampusShifts.get(0));
                Assignment a2 = new Assignment(volunteer, openCampusShifts.get(1));
                assignmentRepo.saveAll(List.of(a1, a2));
            }

            // ========== CONSOLE OUTPUT ==========
            System.out.println("=== DB INITIALIZED ===");
            System.out.println("Users:");
            System.out.println(" admin / Admin@12345! (ADMIN)");
            System.out.println(" organizer / Organizer@12345! (ORGANIZER) → owns Event 1");
            System.out.println(" organizer2 / Organizer2@12345! (ORGANIZER) → owns Event 2");
            System.out.println(" volunteer / Volunteer@12345! (VOLUNTEER)");
            System.out.println("Events:");
            System.out.println(" - Open Campus Day (organizer@email.com)");
            System.out.println(" - Info Evening (organizer2@email.com)");
            System.out.println("Assigned shifts for volunteer: 2");
        };
    }
}