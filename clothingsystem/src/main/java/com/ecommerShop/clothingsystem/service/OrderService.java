package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.model.Order;
import com.ecommerShop.clothingsystem.model.User;

import java.util.List;

public interface OrderService {
    Order createOrder(User user, Long addressId, String paymentMethod);

    List<Order> getMyOrders(User user);

    Order getOrderById(Long id, User user);

    List<Order> getAllOrders();

    Order getOrderById(Long id);

    void updateOrderStatus(Long orderId, String status);

    void deleteOrder(Long id);

    void handlePaymentSuccess(Long orderId);
}
