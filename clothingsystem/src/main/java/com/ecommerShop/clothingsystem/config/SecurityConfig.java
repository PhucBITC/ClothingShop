package com.ecommerShop.clothingsystem.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Cho phép đăng ký/đăng nhập
                        .anyRequest().authenticated() // Còn lại phải có Token
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Thêm vào trong SecurityFilterChain Cấu hình CORS (Rất quan trọng): Hiện tại, nếu bạn chạy React (cổng 5173) và gọi API Java (cổng 8080), trình duyệt sẽ chặn vì lỗi CORS. 
        // Bạn cần thêm cấu hình này vào SecurityConfig.java:
        http.cors(cors -> cors.configurationSource(request -> {
            var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
            corsConfiguration.setAllowedOrigins(java.util.List.of("http://localhost:5173"));
            corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE"));
            corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
            return corsConfiguration;
        }));

        return http.build();
    }
}