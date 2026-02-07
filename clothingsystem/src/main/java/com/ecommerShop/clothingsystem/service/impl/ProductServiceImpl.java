package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.ProductRequest;
import com.ecommerShop.clothingsystem.model.Category;
import com.ecommerShop.clothingsystem.model.Product;
import com.ecommerShop.clothingsystem.model.ProductImage;
import com.ecommerShop.clothingsystem.model.ProductVariant;
import com.ecommerShop.clothingsystem.repository.CategoryRepository;
import com.ecommerShop.clothingsystem.repository.ProductImageRepository;
import com.ecommerShop.clothingsystem.repository.ProductRepository;
import com.ecommerShop.clothingsystem.repository.ProductVariantRepository;
import com.ecommerShop.clothingsystem.service.FileStorageService;
import com.ecommerShop.clothingsystem.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    @Transactional
    public Product createProduct(ProductRequest request, MultipartFile[] files) {
        // 1. Fetch Category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // 2. Save Product Base Info
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setCategory(category);
        product.setStatus("ACTIVE");

        Product savedProduct = productRepository.save(product);

        // 3. Save Variants
        if (request.getVariants() != null) {
            List<ProductVariant> variants = new ArrayList<>();
            for (ProductRequest.VariantDTO vDto : request.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(savedProduct);
                variant.setSize(vDto.getSize());
                variant.setColor(vDto.getColor());
                variant.setStock(vDto.getStock());
                variant.setPrice(vDto.getPrice() != null ? vDto.getPrice() : savedProduct.getBasePrice());
                variants.add(variant);
            }
            productVariantRepository.saveAll(variants);
            savedProduct.setVariants(variants);
        }

        // 4. Save Images (Uploaded Files)
        if (files != null && files.length > 0) {
            List<ProductImage> images = new ArrayList<>();
            boolean isFirst = true;
            for (MultipartFile file : files) {
                String filename = fileStorageService.save(file);
                String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/files/")
                        .path(filename)
                        .toUriString();

                ProductImage image = new ProductImage();
                image.setProduct(savedProduct);
                image.setImageUrl(fileDownloadUri);
                image.setPrimary(isFirst); // First image is primary by default
                if (isFirst)
                    isFirst = false;

                images.add(image);
            }
            productImageRepository.saveAll(images);
            savedProduct.setImages(images);
        }

        return savedProduct;
    }

    @Override
    @Transactional
    public Product updateProduct(Long id, ProductRequest request, MultipartFile[] files) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Update basic info
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        // Update Variants
        productVariantRepository.deleteByProduct(product);
        if (request.getVariants() != null) {
            List<ProductVariant> variants = new ArrayList<>();
            for (ProductRequest.VariantDTO vDto : request.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(product);
                variant.setSize(vDto.getSize());
                variant.setColor(vDto.getColor());
                variant.setStock(vDto.getStock());
                variant.setPrice(vDto.getPrice() != null ? vDto.getPrice() : product.getBasePrice());
                variants.add(variant);
            }
            productVariantRepository.saveAll(variants);
            product.setVariants(variants);
        }

        // Update Images: Append new images if uploaded
        // Note: For true update (replace/delete specific images), we need more complex
        // logic on frontend.
        // Here we just append new files. To clear old images, validation logic or a
        // separate endpoint is needed.
        if (files != null && files.length > 0) {
            // Optional: clear old images if that's the desired behavior for "update"
            // productImageRepository.deleteByProduct(product);

            List<ProductImage> images = product.getImages(); // Keep existing
            if (images == null)
                images = new ArrayList<>();

            for (MultipartFile file : files) {
                String filename = fileStorageService.save(file);
                String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/files/")
                        .path(filename)
                        .toUriString();

                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(fileDownloadUri);
                image.setPrimary(images.isEmpty()); // If no images existed, this is primary
                images.add(image);
            }
            productImageRepository.saveAll(images);
            product.setImages(images);
        }

        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
