package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
