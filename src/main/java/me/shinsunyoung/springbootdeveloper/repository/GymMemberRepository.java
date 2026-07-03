package me.shinsunyoung.springbootdeveloper.repository;

import me.shinsunyoung.springbootdeveloper.domain.GymMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GymMemberRepository extends JpaRepository<GymMember, Long> {
    Optional<GymMember> findByEmail(String email);
}
