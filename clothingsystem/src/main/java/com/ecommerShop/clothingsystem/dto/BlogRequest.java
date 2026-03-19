package com.ecommerShop.clothingsystem.dto;

public class BlogRequest {
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String author;
    private String category;
    private String status;
    private String existingCoverImage;

    public BlogRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getExistingCoverImage() { return existingCoverImage; }
    public void setExistingCoverImage(String existingCoverImage) { this.existingCoverImage = existingCoverImage; }
}
