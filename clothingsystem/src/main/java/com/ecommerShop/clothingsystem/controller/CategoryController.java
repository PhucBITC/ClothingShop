package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.Category;
import com.ecommerShop.clothingsystem.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories") // Đường dẫn gốc cho API này
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // 1. Lấy danh sách tất cả danh mục
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // 2. Tạo mới một danh mục
    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    // 3. Xóa một danh mục theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    categoryRepository.delete(category);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}