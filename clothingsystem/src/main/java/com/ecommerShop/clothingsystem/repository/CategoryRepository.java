package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Strict BANNER Mode: Chỉ lấy các danh mục có chứa sản phẩm mang tag BANNER
    @Query(value = "SELECT DISTINCT c.* FROM categories c " +
            "JOIN products p ON c.id = p.category_id " +
            "WHERE UPPER(p.tags) LIKE '%BANNER%' " +
            "LIMIT 10", nativeQuery = true)
    List<Category> findTopCategoriesBySales();
}
