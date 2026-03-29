package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.TryOnRequest;
import com.ecommerShop.clothingsystem.dto.TryOnResponse;
import com.ecommerShop.clothingsystem.service.TryOnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class TryOnController {

    private final TryOnService tryOnService;

    public TryOnController(TryOnService tryOnService) {
        this.tryOnService = tryOnService;
    }

    @PostMapping("/try-on")
    public ResponseEntity<TryOnResponse> tryOn(@ModelAttribute TryOnRequest request) {
        // Note: Using @ModelAttribute because we are receiving MultipartFile + other
        // fields
        try {
            TryOnResponse response = tryOnService.processTryOn(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new TryOnResponse(null, 0, e.getMessage()));
        }
    }
}
