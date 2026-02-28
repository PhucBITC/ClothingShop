package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.ecommerShop.clothingsystem.service.FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> createUser(
            @RequestPart("user") User user,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }
        if (avatar != null && !avatar.isEmpty()) {
            String filename = fileStorageService.save(avatar, "customers");
            user.setAvatarUrl(filename);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestPart("user") User userDetails,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equals(userDetails.getEmail()) &&
                userRepository.findByEmail(userDetails.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }

        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setRole(userDetails.getRole());
        user.setStatus(userDetails.getStatus());

        if (avatar != null && !avatar.isEmpty()) {
            String filename = fileStorageService.save(avatar, "customers");
            user.setAvatarUrl(filename);
        }

        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
