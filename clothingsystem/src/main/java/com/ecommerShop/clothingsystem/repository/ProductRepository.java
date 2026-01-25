package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Bạn có thể thêm các hàm tìm kiếm nhanh ở đây, ví dụ:
    List<Product> findByCategoryId(Long categoryId);
}