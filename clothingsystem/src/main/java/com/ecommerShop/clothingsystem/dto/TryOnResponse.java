package com.ecommerShop.clothingsystem.dto;

public class TryOnResponse {
    private String imageUrl;
    private int remainingTries;
    private String message;

    public TryOnResponse() {
    }

    public TryOnResponse(String imageUrl, int remainingTries, String message) {
        this.imageUrl = imageUrl;
        this.remainingTries = remainingTries;
        this.message = message;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getRemainingTries() {
        return remainingTries;
    }

    public void setRemainingTries(int remainingTries) {
        this.remainingTries = remainingTries;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
