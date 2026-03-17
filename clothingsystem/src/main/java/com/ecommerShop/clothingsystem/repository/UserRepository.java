package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);

    Optional<User> findByResetPasswordTokenStartingWith(String prefix);

    List<User> findByRole(Role role);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :start AND u.createdAt <= :end")
    long countUsersInRange(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}