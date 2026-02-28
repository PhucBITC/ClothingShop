package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.CartDto;
import com.ecommerShop.clothingsystem.dto.CartItemDto;
import com.ecommerShop.clothingsystem.model.User;

import java.util.List;

public interface CartService {
    CartDto getCart(User user);

    CartDto addToCart(User user, Long variantId, Integer quantity);

    CartDto updateQuantity(User user, Long variantId, Integer quantity);

    CartDto removeFromCart(User user, Long variantId);

    CartDto removeMultipleFromCart(User user, List<Long> variantIds);

    void clearCart(User user);

    CartDto syncCart(User user, List<CartItemDto> guestItems);
}
