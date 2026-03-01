package com.ecommerShop.clothingsystem.service;

import jakarta.servlet.http.HttpServletRequest;

public interface VNPayService {
    String createPaymentUrl(Long orderId, double amount, HttpServletRequest request);

    int orderReturn(HttpServletRequest request);
}
