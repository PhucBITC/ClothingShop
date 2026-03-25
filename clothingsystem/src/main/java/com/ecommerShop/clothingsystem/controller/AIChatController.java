package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.ChatRequest;
import com.ecommerShop.clothingsystem.dto.ChatResponse;
import com.ecommerShop.clothingsystem.service.AIChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private final AIChatService aiChatService;

    public AIChatController(AIChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = aiChatService.generateResponse(request.getMessage());
        return ResponseEntity.ok(response);
    }
}
