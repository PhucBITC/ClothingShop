package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.model.Order;
import com.ecommerShop.clothingsystem.model.User;

import java.util.List;

public interface OrderService {
    Order createOrder(User user, Long addressId, String paymentMethod);

    List<Order> getMyOrders(User user);

    Order getOrderById(Long id, User user);

    void updateOrderStatus(Long orderId, String status);
}
