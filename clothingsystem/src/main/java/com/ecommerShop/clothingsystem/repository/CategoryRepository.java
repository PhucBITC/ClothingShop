package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    @Query(value = "SELECT c.* FROM categories c " +
            "LEFT JOIN products p ON c.id = p.category_id " +
            "LEFT JOIN product_variants pv ON p.id = pv.product_id " +
            "LEFT JOIN order_items oi ON pv.id = oi.product_variant_id " +
            "GROUP BY c.id " +
            "ORDER BY MAX(CASE WHEN p.tags LIKE '%BANNER%' THEN 1 ELSE 0 END) DESC, " +
            "         SUM(COALESCE(oi.quantity, 0)) DESC, " +
            "         c.name ASC " +
            "LIMIT 7", nativeQuery = true)
    List<Category> findTopCategoriesBySales();
}