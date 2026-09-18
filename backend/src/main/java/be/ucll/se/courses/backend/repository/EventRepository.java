package be.ucll.se.courses.backend.repository;

import be.ucll.se.courses.backend.unit.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByTitle(String title);
}
