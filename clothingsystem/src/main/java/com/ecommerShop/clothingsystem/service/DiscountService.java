package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.DiscountRequest;
import com.ecommerShop.clothingsystem.model.Discount;
import java.util.List;

public interface DiscountService {
    List<Discount> getAllDiscounts();
    Discount getDiscountById(Long id);
    Discount createDiscount(DiscountRequest request);
    Discount updateDiscount(Long id, DiscountRequest request);
    void deleteDiscount(Long id);
    void toggleStatus(Long id);
    Discount validateDiscount(String code, Double orderAmount);
    void broadcastDiscount(Long id);

    void incrementUsageCount(Long id);
}
