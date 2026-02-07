package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.ProductRequest;
import com.ecommerShop.clothingsystem.model.Product;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ProductService {
    Product createProduct(ProductRequest request, MultipartFile[] files);

    Product updateProduct(Long id, ProductRequest request, MultipartFile[] files);

    void deleteProduct(Long id);

    List<Product> getAllProducts();

    Product getProductById(Long id);
}
