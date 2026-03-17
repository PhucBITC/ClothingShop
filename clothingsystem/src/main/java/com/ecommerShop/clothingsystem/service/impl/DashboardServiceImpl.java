package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.DashboardStatsDTO;
import com.ecommerShop.clothingsystem.repository.OrderRepository;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String[] CHART_COLORS = {"#FF8800", "#FFBB73", "#FFDCA8", "#F5F6FA"};

    @Override
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO dto = new DashboardStatsDTO();

        // 1. Total Sales & Orders
        Double totalSales = orderRepository.sumTotalRevenue();
        dto.setTotalSales(totalSales != null ? totalSales : 0.0);
        dto.setTotalOrders(orderRepository.countTotalOrders());

        // 2. Total Visitors (Approximated by User count)
        dto.setTotalVisitors(userRepository.count());

        // 3. Revenue Trend (Last 8 Days)
        LocalDateTime eightDaysAgo = LocalDateTime.now().minusDays(7).withHour(0).withMinute(0).withSecond(0);
        List<Object[]> revenueTrendRaw = orderRepository.getRevenueByDateRange(eightDaysAgo);
        List<DashboardStatsDTO.RevenuePoint> revenueData = revenueTrendRaw.stream()
                .map(row -> new DashboardStatsDTO.RevenuePoint(
                        (String) row[0],
                        ((Number) row[1]).doubleValue(),
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
        dto.setRevenueData(revenueData);

        // 4. Category Stats
        List<Object[]> categoryRaw = orderRepository.getRevenueByCategory();
        List<DashboardStatsDTO.CategoryStat> categoryData = new ArrayList<>();
        int colorIndex = 0;
        for (Object[] row : categoryRaw) {
            String categoryName = (String) row[0];
            Double value = ((Number) row[1]).doubleValue();
            String color = CHART_COLORS[colorIndex % CHART_COLORS.length];
            categoryData.add(new DashboardStatsDTO.CategoryStat(categoryName, value, color));
            colorIndex++;
        }
        dto.setCategoryData(categoryData);

        return dto;
    }
}
