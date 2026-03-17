package com.ecommerShop.clothingsystem.dto;

import java.util.List;

public class DashboardStatsDTO {
    private Double totalSales;
    private Long totalOrders;
    private Long totalVisitors;
    private Double salesChange;
    private Double ordersChange;
    private Double visitorsChange;
    private List<LowStockDTO> lowStockProducts;
    private Double monthlyTarget;
    private Double currentMonthSales;
    private List<ConversionStepDTO> conversionData;
    private List<TrafficSourceDTO> trafficSourceData;
    private List<RevenuePoint> revenueData;
    private List<CategoryStat> categoryData;

    public DashboardStatsDTO() {}

    public Double getTotalSales() { return totalSales; }
    public void setTotalSales(Double totalSales) { this.totalSales = totalSales; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public Long getTotalVisitors() { return totalVisitors; }
    public void setTotalVisitors(Long totalVisitors) { this.totalVisitors = totalVisitors; }

    public Double getSalesChange() { return salesChange; }
    public void setSalesChange(Double salesChange) { this.salesChange = salesChange; }

    public Double getOrdersChange() { return ordersChange; }
    public void setOrdersChange(Double ordersChange) { this.ordersChange = ordersChange; }

    public Double getVisitorsChange() { return visitorsChange; }
    public void setVisitorsChange(Double visitorsChange) { this.visitorsChange = visitorsChange; }

    public Double getMonthlyTarget() { return monthlyTarget; }
    public void setMonthlyTarget(Double monthlyTarget) { this.monthlyTarget = monthlyTarget; }

    public Double getCurrentMonthSales() { return currentMonthSales; }
    public void setCurrentMonthSales(Double currentMonthSales) { this.currentMonthSales = currentMonthSales; }

    public List<ConversionStepDTO> getConversionData() { return conversionData; }
    public void setConversionData(List<ConversionStepDTO> conversionData) { this.conversionData = conversionData; }

    public List<TrafficSourceDTO> getTrafficSourceData() { return trafficSourceData; }
    public void setTrafficSourceData(List<TrafficSourceDTO> trafficSourceData) { this.trafficSourceData = trafficSourceData; }

    public static class ConversionStepDTO {
        private String label;
        private String val;
        private Long val_num;
        private String change;
        private Integer h;
        private Boolean red;

        public ConversionStepDTO(String label, String val, Long val_num, String change, Integer h, Boolean red) {
            this.label = label;
            this.val = val;
            this.val_num = val_num;
            this.change = change;
            this.h = h;
            this.red = red;
        }

        public String getLabel() { return label; }
        public String getVal() { return val; }
        public Long getVal_num() { return val_num; }
        public String getChange() { return change; }
        public Integer getH() { return h; }
        public Boolean getRed() { return red; }
    }

    public static class TrafficSourceDTO {
        private String label;
        private String value; // e.g. "40%"

        public TrafficSourceDTO(String label, String value) {
            this.label = label;
            this.value = value;
        }

        public String getLabel() { return label; }
        public String getValue() { return value; }
    }

    public List<LowStockDTO> getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(List<LowStockDTO> lowStockProducts) { this.lowStockProducts = lowStockProducts; }

    public static class LowStockDTO {
        private Long productId;
        private String name;
        private Integer stock;
        private String image;

        public LowStockDTO(Long productId, String name, Integer stock, String image) {
            this.productId = productId;
            this.name = name;
            this.stock = stock;
            this.image = image;
        }

        public Long getProductId() { return productId; }
        public String getName() { return name; }
        public Integer getStock() { return stock; }
        public String getImage() { return image; }
    }

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
