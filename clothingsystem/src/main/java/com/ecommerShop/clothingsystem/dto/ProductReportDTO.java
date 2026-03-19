package com.ecommerShop.clothingsystem.dto;

public class ProductReportDTO {
    private String categoryName;
    private Long productId;
    private String name;
    private String sku;
    private String color;
    private String size;
    private Integer soldQuantity;
    private Integer currentStock;
    private Double totalRevenue;

    public ProductReportDTO() {}

    public ProductReportDTO(String categoryName, Long productId, String name, String sku, String color, String size, 
                            Integer soldQuantity, Integer currentStock, Double totalRevenue) {
        this.categoryName = categoryName;
        this.productId = productId;
        this.name = name;
        this.sku = sku;
        this.color = color;
        this.size = size;
        this.soldQuantity = soldQuantity;
        this.currentStock = currentStock;
        this.totalRevenue = totalRevenue;
    }

    // Getters and Setters
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Integer getSoldQuantity() { return soldQuantity; }
    public void setSoldQuantity(Integer soldQuantity) { this.soldQuantity = soldQuantity; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
}
