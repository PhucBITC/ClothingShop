package com.ecommerShop.clothingsystem.dto;

public class RevenueReportDTO {
    private String date; // Format: yyyy-MM-dd
    private Long orderCount;
    private Double subtotal;
    private Double discountAmount;
    private Double deliveryCharge;
    private Double totalRevenue;

    public RevenueReportDTO() {}

    public RevenueReportDTO(String date, Long orderCount, Double subtotal, 
                            Double discountAmount, Double deliveryCharge, Double totalRevenue) {
        this.date = date;
        this.orderCount = orderCount;
        this.subtotal = subtotal;
        this.discountAmount = discountAmount;
        this.deliveryCharge = deliveryCharge;
        this.totalRevenue = totalRevenue;
    }

    // Getters and Setters
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public Long getOrderCount() { return orderCount; }
    public void setOrderCount(Long orderCount) { this.orderCount = orderCount; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(Double deliveryCharge) { this.deliveryCharge = deliveryCharge; }

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
}
