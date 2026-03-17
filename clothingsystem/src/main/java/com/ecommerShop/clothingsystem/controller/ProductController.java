package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.ProductRequest;
import com.ecommerShop.clothingsystem.model.Product;
import com.ecommerShop.clothingsystem.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // 1. Lấy tất cả sản phẩm
    @GetMapping
    public List<Product> getAllProducts() {
        // Hibernate Initialize or use DTO mapping is better, but for now let's rely on
        // Service transaction
        return productService.getAllProducts();
    }

    // 2. Tạo sản phẩm mới
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<Product> createProduct(
            @RequestPart("product") ProductRequest productRequest,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        try {
            Product createdProduct = productService.createProduct(productRequest, files);
            return ResponseEntity.ok(createdProduct);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(null); 
        }
    }

    // 3. Cập nhật sản phẩm
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") ProductRequest productRequest,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        try {
            Product updatedProduct = productService.updateProduct(id, productRequest, files);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .header("X-Error-Message", e.getMessage())
                    .body(null); 
        }
    }

    // 4. Xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body("Cannot delete product as it is referenced in other records (like orders).");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. Lấy sản phẩm theo ID
    // 5. Lấy sản phẩm theo ID (Update to return 404 properly)
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // 6. Duplicate Product
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Product> duplicateProduct(@PathVariable Long id) {
        try {
            Product duplicated = productService.duplicateProduct(id);
            return ResponseEntity.ok(duplicated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 7. Advanced Search
    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) List<String> colors,
            @RequestParam(required = false) List<String> sizes,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction dir = Sort.Direction.fromString(direction.equalsIgnoreCase("asc") ? "ASC" : "DESC");
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));

        Page<Product> products = productService.searchProducts(keyword, categoryId, minPrice, maxPrice, tag, status, colors,
                sizes, pageable);
        return ResponseEntity.ok(products);
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<Product> toggleActive(@PathVariable Long id) {
        try {
            Product updated = productService.toggleActive(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}