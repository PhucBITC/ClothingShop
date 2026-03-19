package com.ecommerShop.clothingsystem.dto;

public class CategoryBannerDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private Long productCount;

    public CategoryBannerDTO() {
    }

    public CategoryBannerDTO(Long id, String name, String imageUrl, Long productCount) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.productCount = productCount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getProductCount() {
        return productCount;
    }

    public void setProductCount(Long productCount) {
        this.productCount = productCount;
    }
}
