package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.BlogRequest;
import com.ecommerShop.clothingsystem.model.BlogPost;
import com.ecommerShop.clothingsystem.repository.BlogPostRepository;
import com.ecommerShop.clothingsystem.service.BlogService;
import com.ecommerShop.clothingsystem.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@Service
public class BlogServiceImpl implements BlogService {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private FileStorageService fileStorageService;

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
    public BlogPost create(BlogRequest blogRequest, MultipartFile file) {
        BlogPost blogPost = new BlogPost();
        blogPost.setTitle(blogRequest.getTitle());
        blogPost.setExcerpt(blogRequest.getExcerpt());
        blogPost.setContent(blogRequest.getContent());
        blogPost.setAuthor(blogRequest.getAuthor());
        blogPost.setCategory(blogRequest.getCategory());
        blogPost.setStatus(blogRequest.getStatus());

        // Handle File Upload
        if (file != null && !file.isEmpty()) {
            String filename = fileStorageService.save(file);
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/")
                    .path(filename)
                    .toUriString();
            blogPost.setCoverImage(fileDownloadUri);
        } else if (blogRequest.getExistingCoverImage() != null) {
            blogPost.setCoverImage(blogRequest.getExistingCoverImage());
        }

        // Auto-generate slug from title
        if (blogRequest.getSlug() == null || blogRequest.getSlug().isEmpty()) {
            String slug = blogPost.getTitle()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-")
                    .replaceAll("-+", "-")
                    .trim();
            blogPost.setSlug(slug);
        } else {
            blogPost.setSlug(blogRequest.getSlug());
        }
        
        return blogPostRepository.save(blogPost);
    }

    @Override
    public BlogPost update(Long id, BlogRequest blogRequest, MultipartFile file) {
        BlogPost existing = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found with id: " + id));

        existing.setTitle(blogRequest.getTitle());
        existing.setExcerpt(blogRequest.getExcerpt());
        existing.setContent(blogRequest.getContent());
        existing.setAuthor(blogRequest.getAuthor());
        existing.setCategory(blogRequest.getCategory());
        existing.setStatus(blogRequest.getStatus());

        if (blogRequest.getSlug() != null && !blogRequest.getSlug().isEmpty()) {
            existing.setSlug(blogRequest.getSlug());
        }

        // Handle File Upload or Existing Image
        if (file != null && !file.isEmpty()) {
            String filename = fileStorageService.save(file);
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/")
                    .path(filename)
                    .toUriString();
            existing.setCoverImage(fileDownloadUri);
        } else if (blogRequest.getExistingCoverImage() != null) {
            existing.setCoverImage(blogRequest.getExistingCoverImage());
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
