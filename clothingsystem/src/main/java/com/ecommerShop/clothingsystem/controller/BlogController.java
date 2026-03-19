package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.BlogRequest;
import com.ecommerShop.clothingsystem.model.BlogPost;
import com.ecommerShop.clothingsystem.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogService blogService;

    // Get all published blog posts
    @GetMapping
    public List<BlogPost> getAllPublished() {
        return blogService.getAllPublished();
    }

    // Get all blog posts (Admin)
    @GetMapping("/admin")
    public List<BlogPost> getAll() {
        return blogService.getAll();
    }

    // Get blog post by slug
    @GetMapping("/{slug}")
    public ResponseEntity<BlogPost> getBySlug(@PathVariable String slug) {
        try {
            BlogPost blog = blogService.getBySlug(slug);
            return ResponseEntity.ok(blog);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get blog post by ID (Admin)
    @GetMapping("/admin/{id}")
    public ResponseEntity<BlogPost> getById(@PathVariable Long id) {
        try {
            BlogPost blog = blogService.getById(id);
            return ResponseEntity.ok(blog);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get blog posts by category
    @GetMapping("/category/{category}")
    public List<BlogPost> getByCategory(@PathVariable String category) {
        return blogService.getByCategory(category);
    }

    // Create blog post (Admin)
    @PostMapping(value = "/admin")
    public ResponseEntity<BlogPost> create(
            @RequestPart("blog") BlogRequest blogRequest,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            BlogPost created = blogService.create(blogRequest, file);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update blog post (Admin)
    @PutMapping(value = "/admin/{id}")
    public ResponseEntity<BlogPost> update(
            @PathVariable Long id,
            @RequestPart("blog") BlogRequest blogRequest,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            BlogPost updated = blogService.update(id, blogRequest, file);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete blog post (Admin)
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            blogService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
