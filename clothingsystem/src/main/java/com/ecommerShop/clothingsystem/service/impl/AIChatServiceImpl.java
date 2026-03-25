package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.ChatResponse;
import com.ecommerShop.clothingsystem.model.Order;
import com.ecommerShop.clothingsystem.model.Product;
import com.ecommerShop.clothingsystem.repository.OrderRepository;
import com.ecommerShop.clothingsystem.repository.ProductRepository;
import com.ecommerShop.clothingsystem.service.AIChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIChatServiceImpl implements AIChatService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final com.ecommerShop.clothingsystem.repository.UserRepository userRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.chat.api.key:}")
    private String apiKey;

    @Value("${ai.chat.base.url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${ai.chat.model:llama-3.3-70b-versatile}")
    private String modelName;

    public AIChatServiceImpl(
            ProductRepository productRepository, 
            OrderRepository orderRepository,
            com.ecommerShop.clothingsystem.repository.UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public ChatResponse generateResponse(String userMessage) {
        try {
            // 1. Lấy thông tin người dùng hiện tại (nếu có)
            String currentUserEmail = null;
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                currentUserEmail = auth.getName();
            }

            // 2. Lấy dữ liệu sản phẩm làm ngữ cảnh
            List<Product> products = productRepository.findAll();
            String productContext = products.stream()
                    .limit(30)
                    .map(p -> {
                        String categoryName = (p.getCategory() != null) ? p.getCategory().getName() : "Other";
                        return String.format("- %s (%s): $%.2f", p.getName(), categoryName, p.getBasePrice());
                    })
                    .collect(Collectors.joining("\n"));

            // 3. Lấy ngữ cảnh đơn hàng cá nhân (nếu đã đăng nhập)
            String personalContext = "Khách hàng hiện tại chưa đăng nhập (Guest).";
            if (currentUserEmail != null) {
                com.ecommerShop.clothingsystem.model.User user = userRepository.findByEmail(currentUserEmail).orElse(null);
                if (user != null) {
                    List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
                    if (userOrders.isEmpty()) {
                        personalContext = String.format("Khách hàng: %s. Hiện chưa có đơn hàng nào.", user.getFullName());
                    } else {
                        String orderSummary = userOrders.stream()
                                .limit(5)
                                .map(o -> String.format("- Mã DH: %s, Tổng: $%.2f, Trạng thái: %s", 
                                    o.getOrderCode(), o.getTotalPrice(), o.getStatus()))
                                .collect(Collectors.joining("\n"));
                        personalContext = String.format("Khách hàng: %s. 5 đơn hàng gần nhất:\n%s", 
                            user.getFullName(), orderSummary);
                    }
                }
            }

            // 4. Chuẩn bị request body theo định dạng OpenAI
            Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "messages", List.of(
                    Map.of("role", "system", "content", String.format("""
                        You are L&Y Assistant, the AI store clerk for L&Y Clothing Shop.
                        
                        CONTEXT DATA:
                        - Shop Inventory:
                        %s
                        
                        - Current User Stats:
                        %s
                        
                        TASKS:
                        1. Provide product advice and handle customer inquiries about their orders.
                        2. If they ask about orders, use the 'Current User Stats' data above.
                        
                        RULES:
                        - IMPORTANT: All prices in USD ($).
                        - If the user is a Guest and asks for order info, politely ask them to log in first.
                        - If a user has 'PENDING' orders, tell them those are the unpaid ones.
                        - Be professional, stylish, and helpful.
                        """, productContext, personalContext)),
                    Map.of("role", "user", "content", userMessage)
                ),
                "temperature", 0.5,
                "max_tokens", 1024
            );

            // 3. Gọi API Groq
            String response = restClient.post()
                    .uri(baseUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(requestBody)
                    .retrieve()
                    .onStatus(status -> status.value() == 401, (request, responseSpec) -> {
                        throw new RuntimeException("Lỗi xác thực: API Key Groq không hợp lệ!");
                    })
                    .onStatus(status -> status.value() == 429, (request, responseSpec) -> {
                        throw new RuntimeException("Hệ thống đang bận. Vui lòng thử lại sau vài giây!");
                    })
                    .body(String.class);

            if (response == null) {
                return new ChatResponse("AI tạm thời không phản hồi. Vui lòng thử lại sau!");
            }

            // 4. Parse kết quả (Định dạng OpenAI: choices[0].message.content)
            JsonNode root = objectMapper.readTree(response);
            String aiText = root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
            
            return new ChatResponse(aiText);

        } catch (Exception e) {
            String errorMsg = e.getMessage();
            if (errorMsg != null && (errorMsg.contains("Lỗi xác thực") || errorMsg.contains("đang bận"))) {
                return new ChatResponse(errorMsg);
            }
            e.printStackTrace();
            return new ChatResponse("L&Y Assistant hiện đang bận. Vui lòng thử lại sau ít phút!");
        }
    }
}
