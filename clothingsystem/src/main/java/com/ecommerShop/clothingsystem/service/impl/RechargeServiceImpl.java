package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.RechargeRequest;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.PayPalService;
import com.ecommerShop.clothingsystem.service.VNPayService;
import com.ecommerShop.clothingsystem.service.RechargeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RechargeServiceImpl implements RechargeService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VNPayService vnpayService;

    @Autowired
    private PayPalService paypalService;

    @Override
    public String createRechargeUrl(User user, RechargeRequest request, HttpServletRequest httpRequest) {
        double amount;
        String tier = request.getTier().toUpperCase();
        
        if (tier.equals("STANDARD")) {
            amount = 16.0;
        } else if (tier.equals("PRO")) {
            amount = 29.0;
        } else {
            throw new RuntimeException("Invalid tier selected: " + tier);
        }

        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            // Convert USD to VND for VNPay (approx 25000 VND/USD)
            long amountVnd = (long) (amount * 25000);
            return vnpayService.createPaymentUrl(user.getId(), (double) amountVnd, httpRequest);
        } else {
            // PayPal handles USD
            com.ecommerShop.clothingsystem.model.Order dummyOrder = new com.ecommerShop.clothingsystem.model.Order();
            dummyOrder.setId(user.getId()); 
            dummyOrder.setTotalPrice(amount);
            
            String customReturnUrl = "http://localhost:8080/api/recharge/paypal-success?orderId=" + user.getId();
            return paypalService.createPaymentUrl(dummyOrder, customReturnUrl);
        }
    }

    @Override
    @Transactional
    public void handleRechargeSuccess(Long userId, String tier) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (tier.equals("STANDARD")) {
            user.setSubscriptionTier("STANDARD");
            user.setPurchasedCredits(user.getPurchasedCredits() + 200);
        } else if (tier.equals("PRO")) {
            user.setSubscriptionTier("PRO");
            user.setPurchasedCredits(user.getPurchasedCredits() + 1000);
        }
        
        userRepository.save(user);
    }
}
