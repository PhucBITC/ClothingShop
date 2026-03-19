package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.BlogRequest;
import com.ecommerShop.clothingsystem.model.BlogPost;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface BlogService {
    List<BlogPost> getAllPublished();
    List<BlogPost> getAll();
    List<BlogPost> getByCategory(String category);
    BlogPost getBySlug(String slug);
    BlogPost getById(Long id);
    BlogPost create(BlogRequest blogRequest, MultipartFile file);
    BlogPost update(Long id, BlogRequest blogRequest, MultipartFile file);
    void delete(Long id);
}
