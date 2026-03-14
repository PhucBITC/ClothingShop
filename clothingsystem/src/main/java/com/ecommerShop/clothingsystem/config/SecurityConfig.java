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
import com.ecommerShop.clothingsystem.security.oauth2.CustomOAuth2UserService;
import com.ecommerShop.clothingsystem.security.oauth2.OAuth2LoginSuccessHandler;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthFilter;

        @Autowired
        private AuthenticationProvider authenticationProvider;

        @Autowired
        private CustomOAuth2UserService customOAuth2UserService;

        @Autowired
        private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                // THÊM ĐOẠN NÀY ĐỂ MỞ CỬA CHO REACT
                                .cors(cors -> cors.configurationSource(request -> {
                                        var cfg = new org.springframework.web.cors.CorsConfiguration();
                                        cfg.setAllowedOrigins(java.util.List.of("http://localhost:5173",
                                                        "http://localhost:5174",
                                                        "http://127.0.0.1:5173", "http://127.0.0.1:5174"));
                                        cfg.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH",
                                                        "HEAD", "OPTIONS"));
                                        cfg.setAllowedHeaders(java.util.List.of("*"));
                                        return cfg;
                                }))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**", "/api/files/**",
                                                                "/api/orders/vnpay-return",
                                                                "/api/orders/paypal-success")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/products/**", "/api/categories/**",
                                                                "/api/orders/{id}",
                                                                "/api/blogs/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/contact")
                                                .permitAll()
                                                .requestMatchers("/api/orders/admin/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(
                                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2LoginSuccessHandler));

                return http.build();
        }
}