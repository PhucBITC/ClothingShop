package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    List<BlogPost> findByStatusOrderByCreatedAtDesc(String status);
    org.springframework.data.domain.Page<BlogPost> findByStatus(String status, org.springframework.data.domain.Pageable pageable);
    List<BlogPost> findByStatus(String status);
    List<BlogPost> findByStatusAndCategoryOrderByCreatedAtDesc(String status, String category);
    Optional<BlogPost> findBySlug(String slug);
}
