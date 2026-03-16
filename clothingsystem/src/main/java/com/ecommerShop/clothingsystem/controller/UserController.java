package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.ShippingAddress;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.CartRepository;
import com.ecommerShop.clothingsystem.repository.NotificationRepository;
import com.ecommerShop.clothingsystem.repository.OrderRepository;
import com.ecommerShop.clothingsystem.repository.ShippingAddressRepository;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.EmailService;
import com.ecommerShop.clothingsystem.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
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
    private OrderRepository orderRepository;

    @Autowired
    private ShippingAddressRepository shippingAddressRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EmailService emailService;

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
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean permanent) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (permanent) {
            long orderCount = orderRepository.countByUserId(id);
            if (orderCount > 0) {
                // Professional Anonymization for users with history
                user.setFullName("Anonymized User");
                user.setEmail("deleted_user_" + id + "_" + System.currentTimeMillis() + "@deleted.com");
                user.setPhoneNumber(null);
                user.setStatus("ANONYMIZED");
                user.setAvatarUrl(null);
                userRepository.save(user);
                return ResponseEntity.ok("Account has been anonymized to preserve order history. The original email is now available for new registration.");
            } else {
                // Hard Purge for users with no history
                // 1. Delete Shipping Addresses first
                List<ShippingAddress> addresses = shippingAddressRepository.findByUser(user);
                shippingAddressRepository.deleteAll(addresses);
                
                // 2. Delete Cart (Cascade will handle CartItems if set to CascadeType.ALL)
                cartRepository.findByUserId(id).ifPresent(cart -> cartRepository.delete(cart));
                
                // 3. Delete Notifications
                notificationRepository.findByUserIdOrderByCreatedAtDesc(id).forEach(n -> notificationRepository.delete(n));
                
                // 4. Delete User
                userRepository.delete(user);
                return ResponseEntity.ok("User deleted permanently.");
            }
        } else {
            user.setStatus("BANNED");
            userRepository.save(user);
            return ResponseEntity.ok("Customer has been suspended/banned. They can request recovery from the login page.");
        }
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        if ("ACTIVE".equals(user.getStatus())) {
            return ResponseEntity.badRequest().body("User is already active.");
        }

        user.setStatus("ACTIVE");
        userRepository.save(user);

        // Send confirmation email
        try {
            String emailContent = "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;'>"
                    + "<h2 style='color: #4CAF50; text-align: center;'>Account Restored</h2>"
                    + "<p>Hello <strong>" + user.getFullName() + "</strong>,</p>"
                    + "<p>Your account recovery request has been successfully approved by the administration team. Your account is now reactivated.</p>"
                    + "<p>You can now log in with your current password.</p>"
                    + "<div style='text-align: center; margin: 30px 0;'>"
                    + "<a href='http://localhost:5173/login' style='background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;'>Login Now</a>"
                    + "</div>"
                    + "<p>Welcome back!</p>"
                    + "<hr style='border: none; border-top: 1px solid #eee; margin-top: 20px;' />"
                    + "<p style='font-size: 12px; color: #888; text-align: center;'>This is an automated email. Please do not reply.</p>"
                    + "</div>";
            
            emailService.sendHtmlMessage(user.getEmail(), "Your account has been successfully restored", emailContent);
        } catch (Exception e) {
            System.err.println("Failed to send restore email: " + e.getMessage());
            // Proceed even if email fails
        }

        return ResponseEntity.ok("User restored successfully");
    }
}
