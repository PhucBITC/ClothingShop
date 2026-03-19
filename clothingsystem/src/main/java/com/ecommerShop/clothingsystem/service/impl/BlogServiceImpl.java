package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.model.BlogPost;
import com.ecommerShop.clothingsystem.repository.BlogPostRepository;
import com.ecommerShop.clothingsystem.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlogServiceImpl implements BlogService {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Override
    public List<BlogPost> getAllPublished() {
        return blogPostRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED");
    }

    @Override
    public List<BlogPost> getAll() {
        return blogPostRepository.findAll();
    }

    @Override
    public List<BlogPost> getByCategory(String category) {
        return blogPostRepository.findByStatusAndCategoryOrderByCreatedAtDesc("PUBLISHED", category);
    }

    @Override
    public BlogPost getBySlug(String slug) {
        return blogPostRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Blog post not found with slug: " + slug));
    }

    @Override
    public BlogPost getById(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found with ID: " + id));
    }

    @Override
    public BlogPost create(BlogPost blogPost) {
        // Auto-generate slug from title
        if (blogPost.getSlug() == null || blogPost.getSlug().isEmpty()) {
            String slug = blogPost.getTitle()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-")
                    .replaceAll("-+", "-")
                    .trim();
            blogPost.setSlug(slug);
        }
        return blogPostRepository.save(blogPost);
    }

    @Override
    public BlogPost update(Long id, BlogPost blogPost) {
        BlogPost existing = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found with id: " + id));

        existing.setTitle(blogPost.getTitle());
        existing.setExcerpt(blogPost.getExcerpt());
        existing.setContent(blogPost.getContent());
        existing.setCoverImage(blogPost.getCoverImage());
        existing.setAuthor(blogPost.getAuthor());
        existing.setCategory(blogPost.getCategory());
        existing.setStatus(blogPost.getStatus());

        if (blogPost.getSlug() != null && !blogPost.getSlug().isEmpty()) {
            existing.setSlug(blogPost.getSlug());
        }

        return blogPostRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new RuntimeException("Blog post not found with id: " + id);
        }
        blogPostRepository.deleteById(id);
    }
}
