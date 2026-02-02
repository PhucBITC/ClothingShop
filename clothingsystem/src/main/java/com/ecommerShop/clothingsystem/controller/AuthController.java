package com.ecommerShop.clothingsystem.controller;

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
    private EmailService emailService;

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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy email này trong hệ thống.");
        }

        // Tạo OTP 6 số
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        user.setResetPasswordToken(otp); // Lưu OTP tạm vào field token
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(5)); // Hết hạn sau 5 phút
        userRepository.save(user);

        System.out.println("OTP FOR " + email + ": " + otp);

        // Template HTML
        String htmlContent = """
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clothing Shop</a>
                    </div>
                    <p style="font-size:1.1em">Xin chào,</p>
                    <p>Cảm ơn bạn đã lựa chọn Clothing Shop. Sử dụng mã OTP sau để hoàn tất quá trình khôi phục mật khẩu của bạn. Mã OTP có hiệu lực trong 5 phút.</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">"""
                + otp
                + """
                            </h2>
                            <p style="font-size:0.9em;">Xin chào,<br />Clothing Shop Team</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                              <p>Clothing Shop Inc</p>
                              <p>1600 Amphitheatre Parkway</p>
                              <p>California</p>
                            </div>
                          </div>
                        </div>
                        """;

        emailService.sendHtmlMessage(email, "Mã OTP khôi phục mật khẩu", htmlContent);

        return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Email không tồn tại.");
        }

        if (user.getResetPasswordToken() == null || !user.getResetPasswordToken().equals(otp)) {
            return ResponseEntity.badRequest().body("Mã OTP không chính xác.");
        }

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Mã OTP đã hết hạn.");
        }

        // OTP đúng -> Trả về chính OTP làm token để client gửi lên bước reset-password
        // Không tạo token mới ở đây để tránh việc user ấn Back rồi Verify lại bị lỗi
        // Token (OTP) sẽ chỉ bị xóa khi user thực sự đổi mật khẩu thành công

        Map<String, String> response = new HashMap<>();
        response.put("token", otp);
        response.put("message", "OTP hợp lệ.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token"); // Token này là UUID được trả về từ verify-otp
        String newPassword = request.get("newPassword");

        User user = userRepository.findByResetPasswordToken(token).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Token không hợp lệ.");
        }

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token đã hết hạn.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công!");
    }
}