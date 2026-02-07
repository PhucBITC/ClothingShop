package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Product;
import com.ecommerShop.clothingsystem.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductId(Long productId);

    void deleteByProduct(Product product);
}
