package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.dto.RechargeRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface RechargeService {
    String createRechargeUrl(User user, RechargeRequest request, HttpServletRequest httpRequest);
    void handleRechargeSuccess(Long userId, String tier);
}
