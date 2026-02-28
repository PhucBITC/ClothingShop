package com.ecommerShop.clothingsystem.dto;

import java.util.List;

public class CartDto {
    private List<CartItemDto> items;
    private Double subtotal;
    private Double deliveryCharge;
    private Double total;

    public CartDto() {
    }

    public CartDto(List<CartItemDto> items, Double subtotal, Double deliveryCharge, Double total) {
        this.items = items;
        this.subtotal = subtotal;
        this.deliveryCharge = deliveryCharge;
        this.total = total;
    }

    // Getters and Setters
    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getDeliveryCharge() {
        return deliveryCharge;
    }

    public void setDeliveryCharge(Double deliveryCharge) {
        this.deliveryCharge = deliveryCharge;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }
}
