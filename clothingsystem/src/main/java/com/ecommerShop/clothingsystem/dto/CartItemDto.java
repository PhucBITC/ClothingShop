package com.ecommerShop.clothingsystem.dto;

public class CartItemDto {
    private Long variantId;
    private Long productId;
    private String productName;
    private String imageUrl;
    private String color;
    private String size;
    private Double price;
    private Integer quantity;
    private String productSlug;

    public CartItemDto() {
    }

    public CartItemDto(Long variantId, Long productId, String productName, String imageUrl, String color, String size,
            Double price, Integer quantity, String productSlug) {
        this.variantId = variantId;
        this.productId = productId;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.color = color;
        this.size = size;
        this.price = price;
        this.quantity = quantity;
        this.productSlug = productSlug;
    }

    // Getters and Setters
    public Long getVariantId() {
        return variantId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getProductSlug() {
        return productSlug;
    }

    public void setProductSlug(String productSlug) {
        this.productSlug = productSlug;
    }
}
