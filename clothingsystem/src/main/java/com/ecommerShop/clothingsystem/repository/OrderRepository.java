package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Order;
import com.ecommerShop.clothingsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
}
