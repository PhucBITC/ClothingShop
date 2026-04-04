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
@RequestMapping("/api/categories")
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

    // NEW: Lấy các danh mục được gắn tag BANNER để làm banner trang chủ
    @GetMapping("/banners")
    public List<CategoryBannerDTO> getCategoryBanners() {
        // Chỉ lấy những danh mục có sản phẩm mang tag BANNER
        return categoryRepository.findTopCategoriesBySales().stream()
                .map(cat -> {
                    String topImage = productRepository.findTopProductImageByCategoryId(cat.getId());
                    
                    // Xử lý URL tuyệt đối cho hình ảnh
                    if (topImage != null && !topImage.startsWith("http")) {
                        String cleanPath = topImage.startsWith("/") ? topImage.substring(1) : topImage;
                        if (cleanPath.startsWith("api/files/")) {
                             topImage = "http://localhost:8080/" + cleanPath;
                        } else {
                             topImage = "http://localhost:8080/api/files/" + cleanPath;
                        }
                    }

                    long count = productRepository.countByCategoryId(cat.getId());
                    
                    // Fallback nếu không tìm thấy ảnh (mặc dù query đã đảm bảo)
                    if (topImage == null || topImage.isEmpty()) {
                        topImage = "https://placehold.co/600x400?text=Product+Image";
                    }

                    return new CategoryBannerDTO(
                            cat.getId(),
                            cat.getName().toUpperCase() + " COLLECTION",
                            cat.getCategoryType(),
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
                    productRepository.unlinkProductsFromCategory(id);
                    categoryRepository.delete(category);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
