package be.ucll.se.courses.backend.repository;

import be.ucll.se.courses.backend.unit.model.Assignment;
import be.ucll.se.courses.backend.unit.model.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    long countByShiftIdAndStatus(Long shiftId, AssignmentStatus status);

    boolean existsByVolunteerIdAndShiftId(Long volunteerId, Long shiftId);

    @Query("""
        select a from Assignment a
        where a.volunteer.id = :volunteerId
          and a.status = 'CONFIRMED'
          and a.shift.startTime < :end
          and a.shift.endTime > :start
    """)
    List<Assignment> findOverlappingConfirmedAssignments(
            Long volunteerId,
            LocalDateTime start,
            LocalDateTime end
    );

    long countByShiftId(Long shiftId);

    List<Assignment> findByVolunteerId(Long volunteerId);

    @Query("""
    select a
    from Assignment a
    where a.volunteer.id = :volunteerId
      and a.status = be.ucll.se.courses.backend.unit.model.AssignmentStatus.CONFIRMED
""")
    List<Assignment> findConfirmedByVolunteerId(Long volunteerId);


    @Query("""
    select new be.ucll.se.courses.backend.controller.dto.ShiftRowDto(
        s.id,
        s.role,
        s.location,
        s.startTime,
        s.endTime,
        s.headcount,
        count(aAll.id),
        e.id,
        e.title,
        e.startDate,
        e.endDate,
        e.location
    )
    from Assignment aMine
    join aMine.shift s
    join s.event e
    left join Assignment aAll on aAll.shift = s and aAll.status = be.ucll.se.courses.backend.unit.model.AssignmentStatus.CONFIRMED
    where aMine.volunteer.id = :volunteerId
      and aMine.status = be.ucll.se.courses.backend.unit.model.AssignmentStatus.CONFIRMED
    group by s.id, s.role, s.location, s.startTime, s.endTime, s.headcount,
             e.id, e.title, e.startDate, e.endDate, e.location
    order by s.startTime asc
""")
    List<be.ucll.se.courses.backend.controller.dto.ShiftRowDto> findMyAssignedShiftRows(Long volunteerId);

    List<Assignment> findByVolunteerIdAndStatus(Long volunteerId, AssignmentStatus status);

    @Query("""
    select a
    from Assignment a
    join fetch a.shift s
    join fetch s.event e
    where a.volunteer.id = :volunteerId
""")
    List<Assignment> findByVolunteerIdWithShiftAndEvent(Long volunteerId);

}
