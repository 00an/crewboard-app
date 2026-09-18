package be.ucll.se.courses.backend.repository;

import be.ucll.se.courses.backend.unit.model.Role;
import be.ucll.se.courses.backend.unit.model.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);
}
