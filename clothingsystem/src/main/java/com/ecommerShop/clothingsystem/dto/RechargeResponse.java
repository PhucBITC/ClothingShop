package com.ecommerShop.clothingsystem.dto;

import java.util.Map;

public class RechargeResponse {
    private String paymentUrl;
    private String message;
    private Map<String, Object> data;

    public RechargeResponse(String paymentUrl, String message) {
        this.paymentUrl = paymentUrl;
        this.message = message;
    }

    public RechargeResponse(String message) {
        this.message = message;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
