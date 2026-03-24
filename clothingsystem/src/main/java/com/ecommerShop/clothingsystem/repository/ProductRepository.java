package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    // Bạn có thể thêm các hàm tìm kiếm nhanh ở đây, ví dụ:
    List<Product> findByCategoryId(Long categoryId);

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query(value = "SELECT pi.image_url FROM product_images pi " +
            "JOIN ( " +
            "    SELECT p.id, " +
            "           (CASE WHEN p.tags LIKE '%BANNER%' THEN 1 ELSE 0 END) as is_banner, " +
            "           SUM(COALESCE(oi.quantity,0)) as total_sales " +
            "    FROM products p " +
            "    LEFT JOIN product_variants pv ON p.id = pv.product_id " +
            "    LEFT JOIN order_items oi ON pv.id = oi.product_variant_id " +
            "    WHERE p.category_id = :categoryId " +
            "    GROUP BY p.id " +
            "    ORDER BY is_banner DESC, total_sales DESC " +
            "    LIMIT 1 " +
            ") best_product ON pi.product_id = best_product.id " +
            "ORDER BY pi.is_primary DESC " +
            "LIMIT 1", nativeQuery = true)
    String findTopProductImageByCategoryId(@Param("categoryId") Long categoryId);

    long countByCategoryId(Long categoryId);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.category = null WHERE p.category.id = :categoryId")
    void unlinkProductsFromCategory(@Param("categoryId") Long categoryId);
}