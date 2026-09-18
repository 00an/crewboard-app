package be.ucll.se.courses.backend.repository;

import be.ucll.se.courses.backend.unit.model.Availability;
import be.ucll.se.courses.backend.unit.model.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByVolunteerId(Long volunteerId);

    void deleteByVolunteer_Id(Long volunteerId);

    boolean existsByVolunteerIdAndShiftId(Long volunteerId, Long shiftId);

    @Query("""
        select a.volunteer
        from Availability a
        where a.shift.id = :shiftId
    """)
    List<Volunteer> findVolunteersAvailableForShift(Long shiftId);


    @Query("""
        select a.volunteer
        from Availability a
        where a.shift.id = :shiftId
          and not exists (
              select 1 from Assignment ass
              where ass.shift.id = :shiftId
                and ass.volunteer.id = a.volunteer.id
          )
    """)
    List<Volunteer> findVolunteersByShiftId(Long shiftId);

    Optional<Availability> findByVolunteerIdAndShiftId(Long volunteerId, Long shiftId);

    void deleteByVolunteerIdAndShiftId(Long volunteerId, Long shiftId);

    @Query("""
        select a.shift.id
        from Availability a
        where a.volunteer.id = :volunteerId
    """)
    List<Long> findDismissedShiftIds(Long volunteerId);
}
