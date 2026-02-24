package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    // Bạn có thể thêm các hàm tìm kiếm nhanh ở đây, ví dụ:
    List<Product> findByCategoryId(Long categoryId);

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);
}