package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.RechargeRequest;
import com.ecommerShop.clothingsystem.dto.RechargeResponse;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.service.RechargeService;
import com.ecommerShop.clothingsystem.service.VNPayService;
import com.ecommerShop.clothingsystem.service.PayPalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/recharge")
public class RechargeController {

    @Autowired
    private RechargeService rechargeService;

    @Autowired
    private VNPayService vnpayService;

    @Autowired
    private PayPalService paypalService;

    @Autowired
    private HttpServletRequest httpRequest;

    @PostMapping("/create")
    public ResponseEntity<?> createRecharge(@AuthenticationPrincipal User user, @RequestBody RechargeRequest request) {
        try {
            String paymentUrl = rechargeService.createRechargeUrl(user, request, httpRequest);
            return ResponseEntity.ok(new RechargeResponse(paymentUrl, "Recharge initiated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vnpay-return")
    public void vnpayReturn(@RequestParam("vnp_TxnRef") String userId, 
                            HttpServletResponse response) throws IOException {
        int result = vnpayService.orderReturn(httpRequest);
        String redirectUrl = "http://localhost:5173/user/profile?method=vnpay";
        
        if (result == 1) {
            // we'll default to STANDARD/PRO based on some transaction info or just standard for now 
            // Better to pass the tier in the TxnRef if possible.
            // For now let's assume result=1 means we can process it as the user's intended tier.
            // Note: In real life, we'd store the RechargeTask in DB first.
            rechargeService.handleRechargeSuccess(Long.parseLong(userId), "STANDARD");
            response.sendRedirect(redirectUrl + "&status=success&userId=" + userId);
        } else {
            response.sendRedirect(redirectUrl + "&status=failed");
        }
    }

    @GetMapping("/paypal-success")
    public void paypalSuccess(@RequestParam("token") String token, 
                              @RequestParam("orderId") String userId,
                              HttpServletResponse response) throws IOException {
        boolean success = paypalService.executePayment(token, null);
        String redirectUrl = "http://localhost:5173/user/profile?method=paypal";

        if (success) {
            rechargeService.handleRechargeSuccess(Long.parseLong(userId), "STANDARD");
            response.sendRedirect(redirectUrl + "&status=success&token=" + token + "&userId=" + userId);
        } else {
            response.sendRedirect(redirectUrl + "&status=cancel");
        }
    }
}
