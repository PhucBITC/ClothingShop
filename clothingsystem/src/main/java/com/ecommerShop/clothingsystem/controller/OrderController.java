package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.CheckoutRequest;
import com.ecommerShop.clothingsystem.model.Order;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private com.ecommerShop.clothingsystem.service.VNPayService vnpayService;

    @Autowired
    private com.ecommerShop.clothingsystem.service.PayPalService paypalService;

    @Autowired
    private jakarta.servlet.http.HttpServletRequest httpRequest;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@AuthenticationPrincipal User user, @RequestBody CheckoutRequest request) {
        try {
            Order order = orderService.createOrder(user, request.getAddressId(), request.getPaymentMethod());

            if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
                String paymentUrl = vnpayService.createPaymentUrl(order.getId(), Math.round(order.getTotalPrice()),
                        httpRequest);
                return ResponseEntity.ok(new java.util.HashMap<String, String>() {
                    {
                        put("paymentUrl", paymentUrl);
                    }
                });
            } else if ("PAYPAL".equalsIgnoreCase(request.getPaymentMethod())) {
                String paymentUrl = paypalService.createPaymentUrl(order);
                return ResponseEntity.ok(new java.util.HashMap<String, String>() {
                    {
                        put("paymentUrl", paymentUrl);
                    }
                });
            }

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getMyOrders(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id, user));
    }

    // Admin Endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<Order> getAdminOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long orderId,
            @RequestBody java.util.Map<String, String> request) {
        try {
            orderService.updateOrderStatus(orderId, request.get("status"));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }
}
