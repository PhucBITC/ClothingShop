package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.model.ShippingAddress;
import com.ecommerShop.clothingsystem.model.User;

import java.util.List;

public interface ShippingAddressService {
    List<ShippingAddress> getAddressesByUserId(User user);

    List<ShippingAddress> getAddressesByUserId(Long userId);

    ShippingAddress addAddress(User user, ShippingAddress address);

    ShippingAddress updateAddress(User user, Long id, ShippingAddress address);

    void deleteAddress(User user, Long id);

    ShippingAddress setDefaultAddress(User user, Long id);

    ShippingAddress getAddressById(Long id);

    // Admin methods
    ShippingAddress adminAddAddress(Long userId, ShippingAddress address);

    ShippingAddress adminUpdateAddress(Long userId, Long id, ShippingAddress address);

    void adminDeleteAddress(Long id);
}
