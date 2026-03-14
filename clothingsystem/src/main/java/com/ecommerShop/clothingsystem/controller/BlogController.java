package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.BlogPost;
import com.ecommerShop.clothingsystem.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Get blog posts by category
    @GetMapping("/category/{category}")
    public List<BlogPost> getByCategory(@PathVariable String category) {
        return blogService.getByCategory(category);
    }

    // Create blog post (Admin)
    @PostMapping
    public ResponseEntity<BlogPost> create(@RequestBody BlogPost blogPost) {
        try {
            BlogPost created = blogService.create(blogPost);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update blog post (Admin)
    @PutMapping("/{id}")
    public ResponseEntity<BlogPost> update(@PathVariable Long id, @RequestBody BlogPost blogPost) {
        try {
            BlogPost updated = blogService.update(id, blogPost);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete blog post (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            blogService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
