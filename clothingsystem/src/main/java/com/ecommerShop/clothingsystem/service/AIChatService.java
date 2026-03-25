package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.ChatResponse;

public interface AIChatService {
    ChatResponse generateResponse(String message);
}
