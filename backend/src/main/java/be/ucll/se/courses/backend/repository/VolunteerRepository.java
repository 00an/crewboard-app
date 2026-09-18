package be.ucll.se.courses.backend.repository;

import be.ucll.se.courses.backend.unit.model.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {

    Optional<Volunteer> findByUserId(Long userId);

    boolean existsByEmail(String email);

    Optional<Volunteer> findByUserUsername(String username);
    Optional<Volunteer> findByUserEmail(String email);
    @Query("""
  select a.shift.id
  from Availability a
  where a.volunteer.id = :volunteerId
""")
    List<Long> findDismissedShiftIds(Long volunteerId);

}
