package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.DashboardStatsDTO;

import com.ecommerShop.clothingsystem.model.ProductVariant;
import com.ecommerShop.clothingsystem.model.SystemSetting;
import com.ecommerShop.clothingsystem.repository.OrderRepository;
import com.ecommerShop.clothingsystem.repository.ProductVariantRepository;
import com.ecommerShop.clothingsystem.repository.SystemSettingRepository;
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

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    private static final String[] CHART_COLORS = {"#FF8800", "#FFBB73", "#FFDCA8", "#F5F6FA"};

    @Override
    public DashboardStatsDTO getDashboardStats(String period, String startDateStr, String endDateStr) {
        // Fetching dashboard stats with optional date range support
        DashboardStatsDTO dto = new DashboardStatsDTO();

        // 1. Time Ranges for Growth Calculation (Still based on last 7/14 days for simplicity in KPI cards)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thisWeekStart = now.minusDays(7);
        LocalDateTime lastWeekStart = now.minusDays(14);

        // 2. Total Sales & Growth
        Double totalSales = orderRepository.sumTotalRevenue();
        dto.setTotalSales(totalSales != null ? totalSales : 0.0);

        Double thisWeekSales = orderRepository.sumRevenueInRange(thisWeekStart, now);
        Double lastWeekSales = orderRepository.sumRevenueInRange(lastWeekStart, thisWeekStart);
        dto.setSalesChange(calculatePercentageChange(thisWeekSales, lastWeekSales));

        // 3. Total Orders & Growth
        dto.setTotalOrders(orderRepository.countTotalOrders());
        long thisWeekOrders = orderRepository.countOrdersInRange(thisWeekStart, now);
        long lastWeekOrders = orderRepository.countOrdersInRange(lastWeekStart, thisWeekStart);
        dto.setOrdersChange(calculatePercentageChange((double) thisWeekOrders, (double) lastWeekOrders));

        // 4. Total Visitors & Growth
        long totalVisitors = userRepository.count();
        dto.setTotalVisitors(totalVisitors);
        long thisWeekVisitors = userRepository.countUsersInRange(thisWeekStart, now);
        long lastWeekVisitors = userRepository.countUsersInRange(lastWeekStart, thisWeekStart);
        dto.setVisitorsChange(calculatePercentageChange((double) thisWeekVisitors, (double) lastWeekVisitors));

        // 5. Revenue Trend based on period
        List<Object[]> revenueTrendRaw;
        if ("YEAR".equalsIgnoreCase(period)) {
            LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
            revenueTrendRaw = orderRepository.getMonthlyRevenueTrend(startOfYear);
        } else if ("MONTH".equalsIgnoreCase(period)) {
            LocalDateTime thirtyDaysAgo = now.minusDays(30).withHour(0).withMinute(0).withSecond(0);
            revenueTrendRaw = orderRepository.getRevenueByDateRange(thirtyDaysAgo, now);
        } else if ("CUSTOM".equalsIgnoreCase(period) && startDateStr != null && endDateStr != null) {
            try {
                LocalDateTime start = LocalDateTime.parse(startDateStr + "T00:00:00");
                LocalDateTime end = LocalDateTime.parse(endDateStr + "T23:59:59");
                revenueTrendRaw = orderRepository.getRevenueByDateRange(start, end);
            } catch (Exception e) {
                // Fallback to week if parsing fails
                LocalDateTime eightDaysAgo = now.minusDays(7).withHour(0).withMinute(0).withSecond(0);
                revenueTrendRaw = orderRepository.getRevenueByDateRange(eightDaysAgo, now);
            }
        } else {
            // Default: WEEK
            LocalDateTime eightDaysAgo = now.minusDays(7).withHour(0).withMinute(0).withSecond(0);
            revenueTrendRaw = orderRepository.getRevenueByDateRange(eightDaysAgo, now);
        }

        List<DashboardStatsDTO.RevenuePoint> revenueData = revenueTrendRaw.stream()
                .map(row -> new DashboardStatsDTO.RevenuePoint(
                        (String) row[0],
                        ((Number) row[1]).doubleValue(),
                        ((Number) row[2]).longValue()
                ))
                .collect(Collectors.toList());
        dto.setRevenueData(revenueData);

        // 6. Category Stats
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

        // 7. Low Stock Alerts (Stock < 10)
        List<ProductVariant> lowStockRaw = productVariantRepository.findByStockLessThan(10);
        List<DashboardStatsDTO.LowStockDTO> lowStockProducts = lowStockRaw.stream()
                .map(pv -> new DashboardStatsDTO.LowStockDTO(
                        pv.getProduct().getId(),
                        pv.getProduct().getName() + " (" + pv.getSize() + "/" + pv.getColor() + ")",
                        pv.getStock(),
                        (pv.getProduct().getImages() == null || pv.getProduct().getImages().isEmpty()) ? null : pv.getProduct().getImages().get(0).getImageUrl()
                ))
                .collect(Collectors.toList());
        dto.setLowStockProducts(lowStockProducts);

        // 8. Monthly Revenue Target (Phase 2)
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Double currentMonthSales = orderRepository.sumRevenueFrom(startOfMonth);
        dto.setCurrentMonthSales(currentMonthSales != null ? currentMonthSales : 0.0);
        
        // Fetch target from settings, default to 10000 if not found
        Double target = systemSettingRepository.findById("MONTHLY_REVENUE_TARGET")
                .map(s -> Double.parseDouble(s.getSettingValue()))
                .orElse(10000.0);
        dto.setMonthlyTarget(target);

        // 9. Simulated Analytics (Based on real orders for dynamic feel)
        long ordersCount = dto.getTotalOrders();
        List<DashboardStatsDTO.ConversionStepDTO> conversionData = new ArrayList<>();
        conversionData.add(new DashboardStatsDTO.ConversionStepDTO("Product Views", formatK(ordersCount * 25), ordersCount * 25, "+9%", 40, false));
        conversionData.add(new DashboardStatsDTO.ConversionStepDTO("Add to Cart", formatK(ordersCount * 2), ordersCount * 2, "+6%", 60, false));
        conversionData.add(new DashboardStatsDTO.ConversionStepDTO("Checkout", formatK((long)(ordersCount * 1.4)), (long)(ordersCount * 1.4), "+4%", 30, false));
        conversionData.add(new DashboardStatsDTO.ConversionStepDTO("Purchase", formatK(ordersCount), ordersCount, "+7%", 20, false));
        conversionData.add(new DashboardStatsDTO.ConversionStepDTO("Abandoned", formatK(ordersCount), ordersCount, "-5%", 10, true));
        dto.setConversionData(conversionData);

        List<DashboardStatsDTO.TrafficSourceDTO> trafficSourceData = new ArrayList<>();
        trafficSourceData.add(new DashboardStatsDTO.TrafficSourceDTO("Direct Traffic", "40%"));
        trafficSourceData.add(new DashboardStatsDTO.TrafficSourceDTO("Organic Search", "30%"));
        trafficSourceData.add(new DashboardStatsDTO.TrafficSourceDTO("Social Media", "15%"));
        trafficSourceData.add(new DashboardStatsDTO.TrafficSourceDTO("Referral Traffic", "10%"));
        trafficSourceData.add(new DashboardStatsDTO.TrafficSourceDTO("Email Campaigns", "5%"));
        dto.setTrafficSourceData(trafficSourceData);

        return dto;
    }

    @Override
    public void updateMonthlyTarget(Double target) {
        SystemSetting setting = systemSettingRepository.findById("MONTHLY_REVENUE_TARGET")
                .orElse(new SystemSetting("MONTHLY_REVENUE_TARGET", "10000.0"));
        setting.setSettingValue(String.valueOf(target));
        systemSettingRepository.save(setting);
    }

    private String formatK(long value) {
        if (value >= 1000) return String.format("%.1fk", value / 1000.0);
        return String.valueOf(value);
    }

    private Double calculatePercentageChange(Double current, Double previous) {
        if (current == null) current = 0.0;
        if (previous == null || previous == 0.0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((current - previous) / previous) * 100.0;
    }
}
