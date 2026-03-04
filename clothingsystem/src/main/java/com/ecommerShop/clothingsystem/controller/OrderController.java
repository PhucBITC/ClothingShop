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
import java.util.Map;
import java.util.HashMap;

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
                String paymentUrl = vnpayService.createPaymentUrl(order.getId(), order.getTotalPrice(), httpRequest);
                if (paymentUrl == null || paymentUrl.isEmpty()) {
                    throw new RuntimeException("Could not generate VNPay payment URL");
                }
                Map<String, String> responseData = new HashMap<>();
                responseData.put("paymentUrl", paymentUrl);
                return ResponseEntity.ok(responseData);
            } else if ("PAYPAL".equalsIgnoreCase(request.getPaymentMethod())) {
                String paymentUrl = paypalService.createPaymentUrl(order);
                if (paymentUrl == null || paymentUrl.isEmpty()) {
                    throw new RuntimeException("Could not generate PayPal payment URL");
                }
                Map<String, String> responseData = new HashMap<>();
                responseData.put("paymentUrl", paymentUrl);
                return ResponseEntity.ok(responseData);
            } else if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
                return ResponseEntity.ok(order);
            } else {
                throw new RuntimeException("Unsupported payment method: " + request.getPaymentMethod());
            }
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

    @DeleteMapping("/admin/bulk")
    public ResponseEntity<?> deleteOrders(@RequestBody List<Long> ids) {
        orderService.deleteOrders(ids);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/vnpay-return")
    public void vnpayReturn(jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        int result = vnpayService.orderReturn(httpRequest);
        String orderId = httpRequest.getParameter("vnp_TxnRef");
        String redirectUrl = "http://localhost:5173/checkout/review?method=vnpay";

        if (result == 1) {
            orderService.handlePaymentSuccess(Long.parseLong(orderId));
            response.sendRedirect(redirectUrl + "&vnp_ResponseCode=00&orderId=" + orderId);
        } else {
            response.sendRedirect(redirectUrl + "&vnp_ResponseCode=" + httpRequest.getParameter("vnp_ResponseCode")
                    + "&orderId=" + orderId);
        }
    }

    @GetMapping("/paypal-success")
    public void paypalSuccess(@RequestParam("token") String token, @RequestParam("orderId") String orderId,
            jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        boolean success = paypalService.executePayment(token, null);
        String redirectUrl = "http://localhost:5173/checkout/review?method=paypal";

        if (success) {
            orderService.handlePaymentSuccess(Long.parseLong(orderId));
            response.sendRedirect(redirectUrl + "&token=" + token + "&orderId=" + orderId);
        } else {
            response.sendRedirect(redirectUrl + "&status=cancel");
        }
    }
}
