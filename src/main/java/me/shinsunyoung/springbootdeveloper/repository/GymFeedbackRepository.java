package me.shinsunyoung.springbootdeveloper.repository;

import me.shinsunyoung.springbootdeveloper.domain.GymFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GymFeedbackRepository extends JpaRepository<GymFeedback, Long> {
}
