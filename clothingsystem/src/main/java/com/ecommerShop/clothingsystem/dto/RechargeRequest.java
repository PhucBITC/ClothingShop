package com.ecommerShop.clothingsystem.dto;

public class RechargeRequest {
    private String tier;          // STANDARD, PRO
    private String paymentMethod;  // PAYPAL, VNPAY

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
