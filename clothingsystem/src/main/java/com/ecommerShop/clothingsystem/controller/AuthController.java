package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.AuthProvider;
import com.ecommerShop.clothingsystem.model.Role;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import com.ecommerShop.clothingsystem.service.EmailService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private com.ecommerShop.clothingsystem.service.FileStorageService fileStorageService;

    @Autowired
    private EmailService emailService;

    // Temporary storage for pending registrations: email -> OTP metadata
    private static final Map<String, String> pendingOtpStore = new ConcurrentHashMap<>();
    private static final Map<String, LocalDateTime> pendingOtpExpiry = new ConcurrentHashMap<>();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // 1. Validate Email format
        if (user.getEmail() == null || !user.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.badRequest().body("Invalid email format");
        }

        // 2. Validate Password strength
        if (user.getPassword() == null || !user.getPassword().matches("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$")) {
            return ResponseEntity.badRequest()
                    .body("Password must contain at least 8 characters, including uppercase, lowercase and number");
        }

        // 3. Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // 4. Generate OTP and metadata
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        // Format: OTP:ATTEMPTS:RESENDS:TIMESTAMP
        String tokenMetadata = otp + ":0:0:" + System.currentTimeMillis();

        // Store in memory instead of database
        pendingOtpStore.put(user.getEmail(), tokenMetadata);
        pendingOtpExpiry.put(user.getEmail(), LocalDateTime.now().plusMinutes(5));

        // 6. Send OTP Email
        String htmlContent = """
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clothing Shop</a>
                    </div>
                    <p style="font-size:1.1em">Hi,</p>
                    <p>Thank you for choosing Clothing Shop. Use the following OTP to complete your registration. OTP is valid for 5 minutes.</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">"""
                + otp
                + """
                            </h2>
                            <p style="font-size:0.9em;">Regards,<br />Clothing Shop Team</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                          </div>
                        </div>
                        """;
        emailService.sendHtmlMessage(user.getEmail(), "Registration OTP", htmlContent);

        return ResponseEntity.ok("OTP sent to your email. Please verify to complete registration.");
    }

    @PostMapping("/verify-register")
    public ResponseEntity<?> verifyRegister(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String fullName = request.get("fullName");
        String password = request.get("password");

        // 1. Check if email already registered (Double check)
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        String tokenData = pendingOtpStore.get(email);
        LocalDateTime expiry = pendingOtpExpiry.get(email);

        if (tokenData == null || expiry == null) {
            return ResponseEntity.badRequest().body("Invalid session or OTP expired");
        }

        String[] parts = tokenData.split(":");
        String savedOtp = parts[0];
        int attempts = Integer.parseInt(parts[1]);
        int resends = Integer.parseInt(parts[2]);
        long timestamp = Long.parseLong(parts[3]);

        if (expiry.isBefore(LocalDateTime.now())) {
            pendingOtpStore.remove(email);
            pendingOtpExpiry.remove(email);
            return ResponseEntity.badRequest().body("OTP has expired");
        }

        if (attempts >= 5) {
            return ResponseEntity.badRequest().body("Too many incorrect OTP attempts");
        }

        if (!savedOtp.equals(otp)) {
            attempts++;
            pendingOtpStore.put(email, savedOtp + ":" + attempts + ":" + resends + ":" + timestamp);
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        // Success -> Now save user to Database
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.CUSTOMER);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setStatus("ACTIVE");
        userRepository.save(user);

        // Cleanup temporary store
        pendingOtpStore.remove(email);
        pendingOtpExpiry.remove(email);

        return ResponseEntity.ok("Registration successful! You can now login.");
    }

    @PostMapping("/resend-register-otp")
    public ResponseEntity<?> resendRegisterOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Double check if already registered
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        String tokenData = pendingOtpStore.get(email);
        if (tokenData == null) {
            return ResponseEntity.badRequest().body("Session expired or invalid");
        }

        String[] parts = tokenData.split(":");
        int resends = Integer.parseInt(parts[2]);
        long lastSent = Long.parseLong(parts[3]);

        if (resends >= 3) {
            return ResponseEntity.badRequest().body("Maximum OTP resend attempts reached");
        }

        if (System.currentTimeMillis() - lastSent < 60000) {
            return ResponseEntity.badRequest().body("Please wait before requesting another OTP");
        }

        // Generate new OTP
        String newOtp = String.valueOf((int) (Math.random() * 900000) + 100000);
        resends++;
        String newTokenMetadata = newOtp + ":0:" + resends + ":" + System.currentTimeMillis();

        pendingOtpStore.put(email, newTokenMetadata);
        pendingOtpExpiry.put(email, LocalDateTime.now().plusMinutes(5));

        // Send Email
        String htmlContent = """
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clothing Shop</a>
                    </div>
                    <p style="font-size:1.1em">Hi,</p>
                    <p>You requested to resend the OTP. Use the following code to complete your registration. OTP is valid for 5 minutes.</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">"""
                + newOtp
                + """
                            </h2>
                            <p style="font-size:0.9em;">Regards,<br />Clothing Shop Team</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                          </div>
                        </div>
                        """;
        emailService.sendHtmlMessage(email, "Registration OTP (Resent)", htmlContent);

        return ResponseEntity.ok("New OTP sent to your email.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            if ("PENDING".equals(user.getStatus())) {
                return ResponseEntity.badRequest().body("Please verify your email first.");
            }
            // Instead of returning token immediately, create 2FA OTP
            String otp = String.valueOf((int) (Math.random() * 900000) + 100000);

            // Format: OTP:ATTEMPTS:RESENDS:TIMESTAMP
            String tokenMetadata = otp + ":0:0:" + System.currentTimeMillis();
            user.setResetPasswordToken(tokenMetadata);
            user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);

            // Send OTP via email
            String htmlContent = """
                    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                      <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clothing Shop</a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>A new login request was detected. Here is your 2-step verification (2FA) code.</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">"""
                    + otp
                    + """
                                </h2>
                                <p style="font-size:0.9em;">Thanks,<br />Clothing Shop Team</p>
                                <hr style="border:none;border-top:1px solid #eee" />
                              </div>
                            </div>
                            """;
            emailService.sendHtmlMessage(email, "Login Verification Code (2FA)", htmlContent);
            System.out.println("LOGIN OTP FOR " + email + ": " + otp);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Verification code sent to your email.");
            response.put("require2fa", true);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Invalid email or password!");
    }

    @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Email not found.");
        }

        String tokenData = user.getResetPasswordToken();
        if (tokenData == null || !tokenData.contains(":")) {
            return ResponseEntity.badRequest().body("Invalid session or OTP expired");
        }

        String[] parts = tokenData.split(":");
        String savedOtp = parts[0];
        int attempts = Integer.parseInt(parts[1]);
        int resends = Integer.parseInt(parts[2]);
        long timestamp = Long.parseLong(parts[3]);

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP has expired");
        }

        if (attempts >= 5) {
            return ResponseEntity.badRequest().body("Too many incorrect OTP attempts. Please login again.");
        }

        if (!savedOtp.equals(otp)) {
            attempts++;
            user.setResetPasswordToken(savedOtp + ":" + attempts + ":" + resends + ":" + timestamp);
            userRepository.save(user);
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        // Success -> Generate JWT Token
        String token = jwtService.generateToken(user);

        // Delete OTP after successful use
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name()); // Return role (ADMIN/CUSTOMER)
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Email not found in our system.");
        }

        String otpToSend = "";
        // Check for cooldown (60s)
        String existingTokenData = user.getResetPasswordToken();
        if (existingTokenData != null && existingTokenData.contains(":")) {
            String[] parts = existingTokenData.split(":");
            int resends = Integer.parseInt(parts[2]);
            long lastSent = Long.parseLong(parts[3]);

            if (resends >= 3) {
                return ResponseEntity.badRequest().body("Maximum OTP resend attempts reached");
            }

            if (System.currentTimeMillis() - lastSent < 60000) {
                return ResponseEntity.badRequest().body("Please wait before requesting another OTP");
            }

            // Increment resends
            otpToSend = String.valueOf((int) (Math.random() * 900000) + 100000);
            String tokenMetadata = otpToSend + ":0:" + (resends + 1) + ":" + System.currentTimeMillis();
            user.setResetPasswordToken(tokenMetadata);
            user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);
        } else {
            // New request
            otpToSend = String.valueOf((int) (Math.random() * 900000) + 100000);
            String tokenMetadata = otpToSend + ":0:0:" + System.currentTimeMillis();
            user.setResetPasswordToken(tokenMetadata);
            user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);
        }

        System.out.println("OTP FOR " + email + ": " + otpToSend);

        // HTML Template
        String htmlContent = """
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clothing Shop</a>
                    </div>
                    <p style="font-size:1.1em">Hi,</p>
                    <p>Thank you for choosing Clothing Shop. Use the following OTP code to complete your password recovery process. The OTP is valid for 5 minutes.</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">"""
                + otpToSend
                + """
                            </h2>
                            <p style="font-size:0.9em;">Regards,<br />Clothing Shop Team</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                          </div>
                        </div>
                        """;

        emailService.sendHtmlMessage(email, "Password Recovery OTP Code", htmlContent);

        return ResponseEntity.ok("OTP code has been sent to your email.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Email not found.");
        }

        String tokenData = user.getResetPasswordToken();
        if (tokenData == null || !tokenData.contains(":")) {
            return ResponseEntity.badRequest().body("Invalid session or OTP expired");
        }

        String[] parts = tokenData.split(":");
        String savedOtp = parts[0];
        int attempts = Integer.parseInt(parts[1]);
        int resends = Integer.parseInt(parts[2]);
        long timestamp = Long.parseLong(parts[3]);

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP has expired");
        }

        if (attempts >= 5) {
            return ResponseEntity.badRequest().body("Too many incorrect OTP attempts");
        }

        if (!savedOtp.equals(otp)) {
            attempts++;
            user.setResetPasswordToken(savedOtp + ":" + attempts + ":" + resends + ":" + timestamp);
            userRepository.save(user);
            return ResponseEntity.badRequest().body("Invalid OTP code.");
        }

        // Valid OTP -> Return OTP itself as token for reset-password
        Map<String, String> response = new HashMap<>();
        response.put("token", otp);
        response.put("message", "OTP valid.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token"); // This token is the OTP
        String newPassword = request.get("newPassword");

        // Use startsWith because token is stored as "OTP:ATTEMPTS:RESENDS:TIMESTAMP"
        User user = userRepository.findByResetPasswordTokenStartingWith(token + ":").orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid token.");
        }

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token has expired.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@org.springframework.security.core.annotation.AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping(value = "/update", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal User currentUser,
            @RequestPart("user") User userDetails,
            @RequestPart(value = "avatar", required = false) org.springframework.web.multipart.MultipartFile avatar) {

        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(userDetails.getFullName());
        user.setPhoneNumber(userDetails.getPhoneNumber());

        if (avatar != null && !avatar.isEmpty()) {
            String filename = fileStorageService.save(avatar, "customers");
            user.setAvatarUrl(filename);
        }

        return ResponseEntity.ok(userRepository.save(user));
    }
}