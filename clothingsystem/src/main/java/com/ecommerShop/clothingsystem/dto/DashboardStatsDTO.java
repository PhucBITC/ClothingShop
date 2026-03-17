package com.ecommerShop.clothingsystem.dto;

import java.util.List;

public class DashboardStatsDTO {
    private Double totalSales;
    private Long totalOrders;
    private Long totalVisitors;
    private List<RevenuePoint> revenueData;
    private List<CategoryStat> categoryData;

    public DashboardStatsDTO() {}

    public Double getTotalSales() { return totalSales; }
    public void setTotalSales(Double totalSales) { this.totalSales = totalSales; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public Long getTotalVisitors() { return totalVisitors; }
    public void setTotalVisitors(Long totalVisitors) { this.totalVisitors = totalVisitors; }

    public List<RevenuePoint> getRevenueData() { return revenueData; }
    public void setRevenueData(List<RevenuePoint> revenueData) { this.revenueData = revenueData; }

    public List<CategoryStat> getCategoryData() { return categoryData; }
    public void setCategoryData(List<CategoryStat> categoryData) { this.categoryData = categoryData; }

    public static class RevenuePoint {
        private String name; // e.g., "12 Aug"
        private Double revenue;
        private Long order;

        public RevenuePoint(String name, Double revenue, Long order) {
            this.name = name;
            this.revenue = revenue;
            this.order = order;
        }

        public String getName() { return name; }
        public Double getRevenue() { return revenue; }
        public Long getOrder() { return order; }
    }

    public static class CategoryStat {
        private String name;
        private Double value;
        private String color;

        public CategoryStat(String name, Double value, String color) {
            this.name = name;
            this.value = value;
            this.color = color;
        }

        public String getName() { return name; }
        public Double getValue() { return value; }
        public String getColor() { return color; }
    }
}
