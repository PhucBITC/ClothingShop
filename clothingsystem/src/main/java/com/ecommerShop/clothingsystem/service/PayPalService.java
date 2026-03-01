package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.model.Order;

public interface PayPalService {
    String createPaymentUrl(Order order);

    boolean executePayment(String paymentId, String payerId);
}
