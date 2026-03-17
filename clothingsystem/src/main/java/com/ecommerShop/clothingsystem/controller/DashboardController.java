package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.DashboardStatsDTO;
import com.ecommerShop.clothingsystem.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "WEEK") String period,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String startDate,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(period, startDate, endDate));
    }

    @org.springframework.web.bind.annotation.PostMapping("/target")
    public ResponseEntity<String> updateMonthlyTarget(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Double> payload) {
        Double target = payload.get("target");
        if (target == null) return ResponseEntity.badRequest().body("Target is required");
        dashboardService.updateMonthlyTarget(target);
        return ResponseEntity.ok("Target updated successfully");
    }
}
