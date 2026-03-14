package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.model.BlogPost;
import java.util.List;

public interface BlogService {
    List<BlogPost> getAllPublished();
    List<BlogPost> getByCategory(String category);
    BlogPost getBySlug(String slug);
    BlogPost create(BlogPost blogPost);
    BlogPost update(Long id, BlogPost blogPost);
    void delete(Long id);
}
