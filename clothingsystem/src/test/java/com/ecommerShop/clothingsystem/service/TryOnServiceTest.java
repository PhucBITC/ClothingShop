package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.TryOnRequest;
import com.ecommerShop.clothingsystem.dto.TryOnResponse;
import com.ecommerShop.clothingsystem.model.Product;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.ProductRepository;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.impl.TryOnServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TryOnServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TryOnServiceImpl tryOnService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
        ReflectionTestUtils.setField(tryOnService, "dailyLimit", 5);
    }

    @Test
    void testProcessTryOn_DemoMode_ShouldNotIncrementCount() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        user.setTryOnCount(0);

        Product product = new Product();
        product.setId(1L);

        TryOnRequest request = new TryOnRequest();
        request.setProductId(1L);
        request.setMode("DEMO");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        TryOnResponse response = tryOnService.processTryOn(request);

        // Assert
        assertEquals(0, user.getTryOnCount()); // Count should still be 0
        assertTrue(response.getImageUrl().contains("demo"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testProcessTryOn_RealMode_ShouldIncrementCount() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        user.setTryOnCount(0);

        Product product = new Product();
        product.setId(1L);

        TryOnRequest request = new TryOnRequest();
        request.setProductId(1L);
        request.setMode("REAL");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        TryOnResponse response = tryOnService.processTryOn(request);

        // Assert
        assertEquals(1, user.getTryOnCount());
        verify(userRepository, atLeastOnce()).save(user);
    }

    @Test
    void testProcessTryOn_RealMode_LimitReached_ShouldThrowException() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        user.setTryOnCount(5); // Limit is 5
        user.setLastTryOnDate(LocalDateTime.now());

        Product product = new Product();
        product.setId(1L);

        TryOnRequest request = new TryOnRequest();
        request.setProductId(1L);
        request.setMode("REAL");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            tryOnService.processTryOn(request);
        });

        assertTrue(exception.getMessage().contains("hết lượt"));
    }
}
