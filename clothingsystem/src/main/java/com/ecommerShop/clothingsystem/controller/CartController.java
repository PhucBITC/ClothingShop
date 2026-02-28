package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.CartDto;
import com.ecommerShop.clothingsystem.dto.CartItemDto;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartDto> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(@AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {
        Long variantId = Long.valueOf(request.get("variantId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        return ResponseEntity.ok(cartService.addToCart(user, variantId, quantity));
    }

    @PutMapping("/update")
    public ResponseEntity<CartDto> updateQuantity(@AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {
        Long variantId = Long.valueOf(request.get("variantId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        return ResponseEntity.ok(cartService.updateQuantity(user, variantId, quantity));
    }

    @DeleteMapping("/remove/{variantId}")
    public ResponseEntity<CartDto> removeFromCart(@AuthenticationPrincipal User user, @PathVariable Long variantId) {
        return ResponseEntity.ok(cartService.removeFromCart(user, variantId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<CartDto> syncCart(@AuthenticationPrincipal User user,
            @RequestBody List<CartItemDto> guestItems) {
        return ResponseEntity.ok(cartService.syncCart(user, guestItems));
    }
}
