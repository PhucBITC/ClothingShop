package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Product;
import com.ecommerShop.clothingsystem.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    void deleteByProduct(Product product);

    boolean existsBySku(String sku);

    List<ProductVariant> findByStockLessThan(Integer threshold);

    @Modifying
    @Query("UPDATE ProductVariant pv SET pv.stock = pv.stock - :quantity WHERE pv.id = :id AND pv.stock >= :quantity")
    int decrementStock(@Param("id") Long id, @Param("quantity") Integer quantity);
}

