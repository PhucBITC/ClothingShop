package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.DashboardStatsDTO;

public interface DashboardService {
    DashboardStatsDTO getDashboardStats(String period, String startDate, String endDate);
    void updateMonthlyTarget(Double target);
}
