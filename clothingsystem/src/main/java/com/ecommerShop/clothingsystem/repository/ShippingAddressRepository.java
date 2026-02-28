package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.ShippingAddress;
import com.ecommerShop.clothingsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {
    List<ShippingAddress> findByUser(User user);

    @Modifying
    @Query("UPDATE ShippingAddress s SET s.isDefault = false WHERE s.user = ?1")
    void resetDefaultAddress(User user);
}
