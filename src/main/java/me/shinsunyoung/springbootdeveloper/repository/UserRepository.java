package me.shinsunyoung.springbootdeveloper.repository;

import java.util.Optional;

import me.shinsunyoung.springbootdeveloper.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long>{
	Optional<User> findByEmail(String email);

}
