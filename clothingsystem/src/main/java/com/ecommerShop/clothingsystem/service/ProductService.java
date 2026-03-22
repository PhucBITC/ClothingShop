package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.ProductRequest;
import com.ecommerShop.clothingsystem.model.Product;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    Product createProduct(ProductRequest request, MultipartFile[] files);

    Product updateProduct(Long id, ProductRequest request, MultipartFile[] files);

    void deleteProduct(Long id);

    List<Product> getAllProducts();

    Product getProductById(Long id);

    Product duplicateProduct(Long originalId);

    Page<Product> searchProducts(String keyword, Long categoryId, String categoryType, Double minPrice, Double maxPrice, String tag,
            String status, List<String> colors, List<String> sizes, Pageable pageable);

    Product toggleActive(Long id);
}
