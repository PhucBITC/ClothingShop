package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService settingService;

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        // Return only non-sensitive settings if needed, for now all
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @PutMapping
    public ResponseEntity<Void> updateSettings(@RequestBody Map<String, String> settings) {
        settingService.updateSettings(settings);
        return ResponseEntity.ok().build();
    }
}
