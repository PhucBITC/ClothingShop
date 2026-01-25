package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.Role;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email đã tồn tại!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.CUSTOMER);
        userRepository.save(user);
        return ResponseEntity.ok("Đăng ký thành công!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            String token = jwtService.generateToken(user);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Sai email hoặc mật khẩu!");
    }
}