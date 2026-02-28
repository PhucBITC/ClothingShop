package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.ShippingAddress;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.service.ShippingAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class ShippingAddressController {

    @Autowired
    private ShippingAddressService addressService;

    @GetMapping
    public ResponseEntity<List<ShippingAddress>> getAddresses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(addressService.getAddressesByUserId(user));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ShippingAddress>> getUserAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(addressService.getAddressesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<ShippingAddress> addAddress(@AuthenticationPrincipal User user,
            @RequestBody ShippingAddress address) {
        return ResponseEntity.ok(addressService.addAddress(user, address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShippingAddress> updateAddress(@AuthenticationPrincipal User user, @PathVariable Long id,
            @RequestBody ShippingAddress address) {
        return ResponseEntity.ok(addressService.updateAddress(user, id, address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@AuthenticationPrincipal User user, @PathVariable Long id) {
        addressService.deleteAddress(user, id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/set-default")
    public ResponseEntity<ShippingAddress> setDefaultAddress(@AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefaultAddress(user, id));
    }

    // Admin Endpoints
    @PostMapping("/admin/user/{userId}")
    public ResponseEntity<ShippingAddress> adminAddAddress(@PathVariable Long userId,
            @RequestBody ShippingAddress address) {
        return ResponseEntity.ok(addressService.adminAddAddress(userId, address));
    }

    @PutMapping("/admin/user/{userId}/address/{id}")
    public ResponseEntity<ShippingAddress> adminUpdateAddress(@PathVariable Long userId, @PathVariable Long id,
            @RequestBody ShippingAddress address) {
        return ResponseEntity.ok(addressService.adminUpdateAddress(userId, id, address));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> adminDeleteAddress(@PathVariable Long id) {
        addressService.adminDeleteAddress(id);
        return ResponseEntity.ok().build();
    }
}
