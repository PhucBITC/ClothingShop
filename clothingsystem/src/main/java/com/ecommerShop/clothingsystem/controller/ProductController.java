package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.Category;
import com.ecommerShop.clothingsystem.model.Product;
import com.ecommerShop.clothingsystem.repository.CategoryRepository;
import com.ecommerShop.clothingsystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // 1. Lấy tất cả sản phẩm
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. Tạo sản phẩm mới
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        // Kiểm tra xem category_id gửi lên có tồn tại không
        if (product.getCategory() == null || product.getCategory().getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        return categoryRepository.findById(product.getCategory().getId())
                .map(category -> {
                    product.setCategory(category);
                    Product savedProduct = productRepository.save(product);
                    return ResponseEntity.ok(savedProduct);
                })
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setBasePrice(productDetails.getBasePrice());
                    product.setDescription(productDetails.getDescription());
                    // Stock is now managed via ProductVariant
                    // product.setStock(productDetails.getStock());

                    // Variants and Images update logic would go here or in separate endpoints

                    return ResponseEntity.ok(productRepository.save(product));
                }).orElse(ResponseEntity.notFound().build());
    }

    // 4. Xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}