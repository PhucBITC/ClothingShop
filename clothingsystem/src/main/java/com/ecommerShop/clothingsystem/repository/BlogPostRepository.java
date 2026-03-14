package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    List<BlogPost> findByStatusOrderByCreatedAtDesc(String status);
    List<BlogPost> findByStatusAndCategoryOrderByCreatedAtDesc(String status, String category);
    Optional<BlogPost> findBySlug(String slug);
}
