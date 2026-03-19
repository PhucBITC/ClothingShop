package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.BlogPost;
import com.ecommerShop.clothingsystem.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blog-posts")
public class BlogPostController {

    @Autowired
    private BlogPostRepository blogPostRepository;

    // Get latest blog posts for homepage
    @GetMapping("/latest")
    public List<BlogPost> getLatestPosts(@RequestParam(defaultValue = "3") int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        return blogPostRepository.findByStatus("PUBLISHED", pageable).getContent();
    }

    // Get all published posts
    @GetMapping
    public List<BlogPost> getAllPublishedPosts() {
        return blogPostRepository.findByStatus("PUBLISHED");
    }

    // Get post by slug
    @GetMapping("/slug/{slug}")
    public ResponseEntity<BlogPost> getPostBySlug(@PathVariable String slug) {
        return blogPostRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
