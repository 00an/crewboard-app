package be.ucll.se.courses.backend.repository;

import be.ucll.se.courses.backend.controller.dto.ShiftRowDto;
import be.ucll.se.courses.backend.unit.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {

    List<Shift> findByEventId(Long eventId);
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
        from Shift s
        join s.event e
        left join Assignment aAll on aAll.shift = s and aAll.status = be.ucll.se.courses.backend.unit.model.AssignmentStatus.CONFIRMED
        group by s.id, s.role, s.location, s.startTime, s.endTime, s.headcount,
                 e.id, e.title, e.startDate, e.endDate, e.location
        having count(aAll.id) < s.headcount
        order by s.startTime asc
    """)
    List<ShiftRowDto> findOpenShiftRows();
}
