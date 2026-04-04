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
    
    List<Product> findByCategoryId(Long categoryId);

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    // Lấy ảnh của sản phẩm có tag BANNER trong danh mục
    @Query(value = "SELECT pi.image_url FROM product_images pi " +
            "JOIN products p ON pi.product_id = p.id " +
            "WHERE p.category_id = :categoryId AND UPPER(p.tags) LIKE '%BANNER%' " +
            "ORDER BY pi.is_primary DESC " +
            "LIMIT 1", nativeQuery = true)
    String findTopProductImageByCategoryId(@Param("categoryId") Long categoryId);

    long countByCategoryId(Long categoryId);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.category = null WHERE p.category.id = :categoryId")
    void unlinkProductsFromCategory(@Param("categoryId") Long categoryId);
}
