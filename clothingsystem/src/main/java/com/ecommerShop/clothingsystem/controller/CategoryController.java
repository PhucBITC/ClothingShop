package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.Category;
import com.ecommerShop.clothingsystem.repository.CategoryRepository;
import com.ecommerShop.clothingsystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.ecommerShop.clothingsystem.dto.CategoryBannerDTO;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories") // Đường dẫn gốc cho API này
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    // 1. Lấy danh sách tất cả danh mục
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // NEW: Lấy 7 danh mục "hot" nhất để làm banner trang chủ
    @GetMapping("/banners")
    public List<CategoryBannerDTO> getCategoryBanners() {
        return categoryRepository.findTopCategoriesBySales().stream()
                .map(cat -> {
                    String topImage = productRepository.findTopProductImageByCategoryId(cat.getId());
                    
                    // Ensure absolute URL for dynamic images
                    if (topImage != null && !topImage.startsWith("http") && !topImage.startsWith("/api/files/")) {
                        topImage = "/api/files/" + topImage;
                    }

                    long count = productRepository.countByCategoryId(cat.getId());
                    
                    // Fallback image if category has no products
                    if (topImage == null || topImage.isEmpty()) {
                        topImage = "https://placehold.co/600x400?text=Product+Image";
                    }

                    return new CategoryBannerDTO(
                            cat.getId(),
                            cat.getName().toUpperCase() + " COLLECTION",
                            topImage,
                            count
                    );
                })
                .collect(Collectors.toList());
    }

    // 2. Tạo mới một danh mục
    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    // 3. Lấy danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(categoryDetails.getName());
                    category.setDescription(categoryDetails.getDescription());
                    category.setCategoryType(categoryDetails.getCategoryType());
                    return ResponseEntity.ok(categoryRepository.save(category));
                }).orElse(ResponseEntity.notFound().build());
    }

    // 3. Xóa một danh mục theo ID
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    // Cập nhật các sản phẩm liên quan bằng batch update
                    productRepository.unlinkProductsFromCategory(id);

                    categoryRepository.delete(category);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}