package com.ecommerShop.clothingsystem.service;

public interface EmailService {
    void sendHtmlMessage(String to, String subject, String htmlBody);
}
