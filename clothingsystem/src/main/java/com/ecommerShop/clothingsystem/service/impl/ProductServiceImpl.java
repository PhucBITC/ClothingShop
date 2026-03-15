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
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

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

        // Generate Slug
        product.setSlug(generateUniqueSlug(request.getName()));

        // Set New Fields
        product.setMetaTitle(request.getMetaTitle());
        product.setMetaDescription(request.getMetaDescription());
        product.setTags(request.getTags());
        product.setWeight(request.getWeight());
        product.setLength(request.getLength());
        product.setWidth(request.getWidth());
        product.setHeight(request.getHeight());

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
                variant.setSalePrice(vDto.getSalePrice());

                // Generate SKU
                variant.setSku(generateSku(savedProduct.getSlug(), vDto.getColor(), vDto.getSize()));

                variants.add(variant);
            }
            productVariantRepository.saveAll(variants);
            savedProduct.setVariants(variants);
        }

        // 4. Save Images
        saveImages(files, savedProduct, true);

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

        // Update New Fields
        product.setMetaTitle(request.getMetaTitle());
        product.setMetaDescription(request.getMetaDescription());
        product.setTags(request.getTags());
        product.setWeight(request.getWeight());
        product.setLength(request.getLength());
        product.setWidth(request.getWidth());
        product.setHeight(request.getHeight());

        // Update Variants
        if (request.getVariants() != null) {
            product.getVariants().clear();
        }

        // Update Images (existing ones)
        if (request.getImages() != null) {
            product.getImages().clear();
        }

        // IMPORTANT: Flush deletions before adding new ones to avoid "Duplicate entry"
        // (SKU collision)
        // because Hibernate flushes INSERTS before DELETES by default.
        productRepository.saveAndFlush(product);

        // Re-add Variants
        if (request.getVariants() != null) {
            for (ProductRequest.VariantDTO vDto : request.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(product);
                variant.setSize(vDto.getSize());
                variant.setColor(vDto.getColor());
                variant.setStock(vDto.getStock());
                variant.setPrice(vDto.getPrice() != null ? vDto.getPrice() : product.getBasePrice());
                variant.setSalePrice(vDto.getSalePrice());

                // Regenerate SKU based on existing slug
                variant.setSku(generateSku(product.getSlug(), vDto.getColor(), vDto.getSize()));

                product.getVariants().add(variant);
            }
        }

        // Re-add Existing Images from Request
        if (request.getImages() != null) {
            for (ProductRequest.ImageDTO imgDto : request.getImages()) {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                
                String url = imgDto.getImageUrl();
                // Nếu URL chỉ là tên file hoặc đường dẫn tương đối, hãy gắn thêm domain/prefix
                if (url != null && !url.startsWith("http") && !url.startsWith("/api/files/")) {
                    url = ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/api/files/")
                            .path(url)
                            .toUriString();
                }
                
                image.setImageUrl(url);
                image.setPrimary(imgDto.isPrimary());
                product.getImages().add(image);
            }
        }

        if (files != null && files.length > 0) {
            saveImages(files, product, false);
        }

        return productRepository.save(product);
    }

    private void saveImages(MultipartFile[] files, Product product, boolean isNewProduct) {
        if (files == null || files.length == 0)
            return;

        List<ProductImage> images = product.getImages();
        if (images == null) {
            images = new ArrayList<>();
            product.setImages(images);
        }

        boolean hasPrimary = images.stream().anyMatch(ProductImage::isPrimary);

        for (MultipartFile file : files) {
            String filename = fileStorageService.save(file, "products");
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/")
                    .path(filename)
                    .toUriString();

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(fileDownloadUri);

            if (!hasPrimary) {
                image.setPrimary(true);
                hasPrimary = true;
            } else {
                image.setPrimary(false);
            }
            images.add(image);
        }
        productImageRepository.saveAll(images);
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

    @Override
    @Transactional
    public Product duplicateProduct(Long originalId) {
        Product original = getProductById(originalId);

        Product copy = new Product();
        copy.setName(original.getName() + " (Copy)");
        copy.setDescription(original.getDescription());
        copy.setBasePrice(original.getBasePrice());
        copy.setCategory(original.getCategory());
        copy.setStatus("DRAFT");

        // Copy New Fields
        copy.setMetaTitle(original.getMetaTitle());
        copy.setMetaDescription(original.getMetaDescription());
        copy.setTags(original.getTags());
        copy.setWeight(original.getWeight());
        copy.setLength(original.getLength());
        copy.setWidth(original.getWidth());
        copy.setHeight(original.getHeight());

        copy.setSlug(generateUniqueSlug(copy.getName()));

        Product savedCopy = productRepository.save(copy);

        // Copy Variants
        List<ProductVariant> newVariants = new ArrayList<>();
        if (original.getVariants() != null) {
            for (ProductVariant v : original.getVariants()) {
                ProductVariant newV = new ProductVariant();
                newV.setProduct(savedCopy);
                newV.setSize(v.getSize());
                newV.setColor(v.getColor());
                newV.setStock(v.getStock());
                newV.setPrice(v.getPrice());
                newV.setSalePrice(v.getSalePrice());
                newV.setSku(generateSku(savedCopy.getSlug(), v.getColor(), v.getSize()));
                newVariants.add(newV);
            }
            productVariantRepository.saveAll(newVariants);
            savedCopy.setVariants(newVariants);
        }

        // Copy Images
        List<ProductImage> newImages = new ArrayList<>();
        if (original.getImages() != null) {
            for (ProductImage img : original.getImages()) {
                ProductImage newImg = new ProductImage();
                newImg.setProduct(savedCopy);
                newImg.setImageUrl(img.getImageUrl());
                newImg.setPrimary(img.isPrimary());
                newImages.add(newImg);
            }
            productImageRepository.saveAll(newImages);
            savedCopy.setImages(newImages);
        }

        return savedCopy;
    }

    @Override
    public Page<Product> searchProducts(String keyword, Long categoryId, Double minPrice, Double maxPrice, String tag,
            String status, List<String> colors, List<String> sizes, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern)));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }

            if (StringUtils.hasText(tag)) {
                predicates.add(cb.like(cb.lower(root.get("tags")), "%" + tag.toLowerCase() + "%"));
            }
            
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // JOIN with Variants for Color and Size filtering
            if ((colors != null && !colors.isEmpty()) || (sizes != null && !sizes.isEmpty())) {
                jakarta.persistence.criteria.Join<Product, ProductVariant> variants = root.join("variants");

                if (colors != null && !colors.isEmpty()) {
                    predicates.add(variants.get("color").in(colors));
                }

                if (sizes != null && !sizes.isEmpty()) {
                    predicates.add(variants.get("size").in(sizes));
                }

                // Ensure distinct products when joining
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable);
    }

    // --- Helpers ---

    @Override
    @Transactional
    public Product toggleActive(Long id) {
        Product product = getProductById(id);
        if ("ACTIVE".equalsIgnoreCase(product.getStatus())) {
            product.setStatus("HIDDEN");
        } else {
            product.setStatus("ACTIVE");
        }
        return productRepository.save(product);
    }

    private String generateUniqueSlug(String name) {
        if (name == null)
            return "";
        String slug = Normalizer.normalize(name, Normalizer.Form.NFD);
        slug = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(slug).replaceAll("");
        slug = slug.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");

        String originalSlug = slug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = originalSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    private String generateSku(String productSlug, String color, String size) {
        // Simple generation: SLUG-COLOR-SIZE (uppercased)
        // Ensure no nulls
        String c = color != null ? color : "NA";
        String s = size != null ? size : "NA";
        String part1 = productSlug != null ? productSlug : "PROD";

        return (part1 + "-" + c + "-" + s).toUpperCase();
    }
}
