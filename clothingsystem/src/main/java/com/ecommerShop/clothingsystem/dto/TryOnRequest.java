package com.ecommerShop.clothingsystem.dto;

import org.springframework.web.multipart.MultipartFile;

public class TryOnRequest {
    private Long productId;
    private String mode; // "DEMO" or "REAL"
    private MultipartFile userImage;

    public TryOnRequest() {
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public MultipartFile getUserImage() {
        return userImage;
    }

    public void setUserImage(MultipartFile userImage) {
        this.userImage = userImage;
    }
}
