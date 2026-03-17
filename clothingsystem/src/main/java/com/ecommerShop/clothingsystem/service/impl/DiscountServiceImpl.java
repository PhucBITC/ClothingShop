package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.DiscountRequest;
import com.ecommerShop.clothingsystem.model.Discount;
import com.ecommerShop.clothingsystem.repository.DiscountRepository;
import com.ecommerShop.clothingsystem.service.DiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DiscountServiceImpl implements DiscountService {

    @Autowired
    private DiscountRepository discountRepository;

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
