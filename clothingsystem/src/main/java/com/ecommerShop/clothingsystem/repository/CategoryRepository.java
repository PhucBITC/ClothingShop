package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // JpaRepository đã có sẵn các hàm save(), findAll(), findById(), deleteById()
}