package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.DiscountRequest;
import com.ecommerShop.clothingsystem.model.Discount;
import com.ecommerShop.clothingsystem.model.Notification;
import com.ecommerShop.clothingsystem.repository.DiscountRepository;
import com.ecommerShop.clothingsystem.service.DiscountService;
import com.ecommerShop.clothingsystem.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiscountServiceImpl implements DiscountService {

    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public List<Discount> getAllDiscounts() {
        return discountRepository.findAll();
    }

    @Override
    public Discount getDiscountById(Long id) {
        return discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found with id: " + id));
    }

    @Override
    @Transactional
    public Discount createDiscount(DiscountRequest request) {
        if (discountRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Discount code already exists: " + request.getCode());
        }

        Discount discount = new Discount();
        mapRequestToEntity(request, discount);
        return discountRepository.save(discount);
    }

    @Override
    @Transactional
    public Discount updateDiscount(Long id, DiscountRequest request) {
        Discount discount = getDiscountById(id);
        
        // If code changes, ensure uniqueness
        if (!discount.getCode().equals(request.getCode())) {
            if (discountRepository.findByCode(request.getCode()).isPresent()) {
                throw new RuntimeException("Target discount code already exists: " + request.getCode());
            }
        }

        mapRequestToEntity(request, discount);
        return discountRepository.save(discount);
    }

    @Override
    @Transactional
    public void deleteDiscount(Long id) {
        Discount discount = getDiscountById(id);
        discountRepository.delete(discount);
    }

    @Override
    @Transactional
    public void toggleStatus(Long id) {
        Discount discount = getDiscountById(id);
        discount.setIsActive(!discount.getIsActive());
        discountRepository.save(discount);
    }

    @Override
    public Discount validateDiscount(String code, Double orderAmount) {
        Discount discount = discountRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid discount code: " + code));

        if (!discount.getIsActive()) {
            throw new RuntimeException("This discount code is inactive.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (discount.getStartDate() != null && now.isBefore(discount.getStartDate())) {
            throw new RuntimeException("This discount code is not yet active.");
        }
        if (discount.getEndDate() != null && now.isAfter(discount.getEndDate())) {
            throw new RuntimeException("This discount code has expired.");
        }

        if (discount.getUsageLimit() != null && discount.getUsageCount() >= discount.getUsageLimit()) {
            throw new RuntimeException("This discount code has reached its usage limit.");
        }

        if (discount.getMinOrderAmount() != null && orderAmount < discount.getMinOrderAmount()) {
            throw new RuntimeException("Order amount is below the minimum required for this discount: $" + discount.getMinOrderAmount());
        }

        return discount;
    }

    @Override
    @Transactional
    public void broadcastDiscount(Long id) {
        Discount discount = getDiscountById(id);
        String title = "New discount code: " + discount.getCode();
        String content = "Use code " + discount.getCode() + " to get attractive offers! " +
                (discount.getDescription() != null ? discount.getDescription() : "");
        
        notificationService.broadcastGlobalNotification(title, content, Notification.NotificationType.PROMO);
    }

    @Override
    @Transactional
    public void incrementUsageCount(Long id) {
        Discount discount = getDiscountById(id);
        discount.setUsageCount(discount.getUsageCount() + 1);
        discountRepository.save(discount);
    }

    private void mapRequestToEntity(DiscountRequest request, Discount discount) {
        discount.setCode(request.getCode());
        discount.setDescription(request.getDescription());
        discount.setType(request.getType());
        discount.setValue(request.getValue());
        discount.setMinOrderAmount(request.getMinOrderAmount());
        discount.setMaxDiscountAmount(request.getMaxDiscountAmount());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) {
            discount.setIsActive(request.getIsActive());
        }
    }
}
