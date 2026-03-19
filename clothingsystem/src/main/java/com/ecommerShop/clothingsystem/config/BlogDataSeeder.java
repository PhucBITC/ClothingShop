package com.ecommerShop.clothingsystem.config;

import com.ecommerShop.clothingsystem.model.BlogPost;
import com.ecommerShop.clothingsystem.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class BlogDataSeeder implements CommandLineRunner {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Override
    public void run(String... args) throws Exception {
        if (blogPostRepository.count() == 0) {
            BlogPost post1 = new BlogPost();
            post1.setTitle("Top 10 Fashion Trends for 2025");
            post1.setSlug("top-10-fashion-trends-2025");
            post1.setExcerpt("Discover the hottest trends shaping the fashion world this year, from oversized silhouettes to sustainable luxury materials.");
            post1.setContent("<p>The fashion landscape is evolving rapidly, and 2025 brings a fresh wave of trends that blend innovation with timeless elegance. Here's our curated guide to the styles that will define the year.</p><h3>1. Oversized Silhouettes</h3><p>Comfort meets style with oversized blazers, flowing trousers, and loose-fit coats.</p><h3>2. Sustainable Luxury</h3><p>Eco-conscious fashion is no longer a trend — it's a movement.</p>");
            post1.setCoverImage("https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80");
            post1.setAuthor("Linh Nguyen");
            post1.setCategory("TRENDS");
            post1.setStatus("PUBLISHED");

            BlogPost post2 = new BlogPost();
            post2.setTitle("5 Ways to Style a White Shirt");
            post2.setSlug("5-ways-style-white-shirt");
            post2.setExcerpt("The classic white shirt is the most versatile piece in your wardrobe. Here are five creative ways to elevate this timeless staple.");
            post2.setContent("<p>A white shirt is the ultimate wardrobe essential. Whether you're heading to the office, a casual brunch, or an evening event, this single piece can be transformed endlessly.</p>");
            post2.setCoverImage("https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80");
            post2.setAuthor("Hana Pham");
            post2.setCategory("STYLING_TIPS");
            post2.setStatus("PUBLISHED");

            BlogPost post3 = new BlogPost();
            post3.setTitle("Spring/Summer 2025 Collection Preview");
            post3.setSlug("spring-summer-2025-collection");
            post3.setExcerpt("Get an exclusive first look at our upcoming Spring/Summer collection, featuring light fabrics, vibrant colors, and coastal-inspired designs.");
            post3.setContent("<p>Our Spring/Summer 2025 collection draws inspiration from the Mediterranean coastline.</p>");
            post3.setCoverImage("https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80");
            post3.setAuthor("Minh Tran");
            post3.setCategory("NEW_COLLECTION");
            post3.setStatus("PUBLISHED");

            blogPostRepository.saveAll(Arrays.asList(post1, post2, post3));
            System.out.println(">> Blog data seeded successfully!");
        }
    }
}
