package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.TryOnRequest;
import com.ecommerShop.clothingsystem.dto.TryOnResponse;
import com.ecommerShop.clothingsystem.model.Product;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.ProductRepository;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.TryOnService;
import com.ecommerShop.clothingsystem.service.FileStorageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TryOnServiceImpl implements TryOnService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.tryon.limit:100}")
    private int dailyLimit;

    // URL của Google Colab server (cập nhật mỗi khi chạy lại Colab)
    @Value("${ai.tryon.colab.url:}")
    private String colabUrl;

    public TryOnServiceImpl(ProductRepository productRepository, UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional
    public TryOnResponse processTryOn(TryOnRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateRateLimit(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (colabUrl == null || colabUrl.isBlank()) {
            throw new RuntimeException(
                    "AI Server chưa được cấu hình. Vui lòng chạy Google Colab trước! (Xem hướng dẫn trong README)");
        }

        // Gọi Colab API
        String resultImageUrl = callColabAI(product, request.getUserImage());

        // Tăng đếm lượt thử
        user.setTryOnCount(user.getTryOnCount() + 1);
        user.setLastTryOnDate(LocalDateTime.now());
        userRepository.save(user);

        int remaining = dailyLimit - user.getTryOnCount();
        return new TryOnResponse(resultImageUrl, Math.max(0, remaining), "Ghép ảnh thành công!");
    }

    private void validateRateLimit(User user) {
        if (user.getLastTryOnDate() != null) {
            LocalDate lastDate = user.getLastTryOnDate().toLocalDate();
            if (!lastDate.equals(LocalDate.now())) {
                user.setTryOnCount(0);
                userRepository.save(user);
            }
        }
        if (user.getTryOnCount() >= dailyLimit) {
            throw new RuntimeException("LIMIT_REACHED: Bạn đã dùng hết lượt thử miễn phí hôm nay.");
        }
    }

    private byte[] getProductImageBytes(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty())
            return null;
        try {
            if (imageUrl.startsWith("http")) {
                HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
                HttpRequest req = HttpRequest.newBuilder().uri(URI.create(imageUrl)).GET().build();
                HttpResponse<byte[]> res = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
                if (res.statusCode() == 200)
                    return res.body();
            }
            String filename = imageUrl;
            if (imageUrl.contains("/uploads/")) {
                filename = imageUrl.substring(imageUrl.indexOf("/uploads/") + 9);
            } else if (imageUrl.startsWith("/")) {
                filename = imageUrl.substring(1);
            }
            Resource resource = fileStorageService.load(filename);
            if (resource != null && resource.exists()) {
                return StreamUtils.copyToByteArray(resource.getInputStream());
            }
        } catch (Exception e) {
            System.err.println("Lỗi đọc ảnh sản phẩm: " + e.getMessage());
        }
        return null;
    }

    private String callColabAI(Product product, MultipartFile imageFile) {
        try {
            System.out.println("Đang gọi AI Server trên Google Colab: " + colabUrl);

            // Lấy bytes ảnh sản phẩm
            byte[] productBytes = null;
            if (!product.getImages().isEmpty()) {
                productBytes = getProductImageBytes(product.getImages().get(0).getImageUrl());
            }
            if (productBytes == null) {
                throw new RuntimeException("Không tìm thấy ảnh sản phẩm.");
            }

            // Tạo multipart form-data request
            String boundary = "boundary-" + UUID.randomUUID();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // Part 1: Human image
            baos.write(("--" + boundary + "\r\n").getBytes());
            baos.write(("Content-Disposition: form-data; name=\"human_image\"; filename=\"human.jpg\"\r\n").getBytes());
            baos.write(("Content-Type: " + imageFile.getContentType() + "\r\n\r\n").getBytes());
            baos.write(imageFile.getBytes());
            baos.write("\r\n".getBytes());

            // Part 2: Garment image
            baos.write(("--" + boundary + "\r\n").getBytes());
            baos.write(("Content-Disposition: form-data; name=\"garment_image\"; filename=\"garment.jpg\"\r\n")
                    .getBytes());
            baos.write("Content-Type: image/jpeg\r\n\r\n".getBytes());
            baos.write(productBytes);
            baos.write("\r\n".getBytes());

            // Part 3: Description
            baos.write(("--" + boundary + "\r\n").getBytes());
            baos.write("Content-Disposition: form-data; name=\"garment_desc\"\r\n\r\n".getBytes());
            baos.write(product.getName().getBytes());
            baos.write(("\r\n--" + boundary + "--\r\n").getBytes());

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(30))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(colabUrl + "/tryon"))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .timeout(Duration.ofMinutes(3))
                    .POST(HttpRequest.BodyPublishers.ofByteArray(baos.toByteArray()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode json = objectMapper.readTree(response.body());
                if (json.has("success") && json.get("success").asBoolean()) {
                    String imageData = json.get("image").asText();
                    System.out.println("Ghép ảnh thành công từ Colab AI!");
                    return imageData;
                } else {
                    throw new RuntimeException("AI Server báo lỗi: " + json.get("error").asText());
                }
            } else {
                throw new RuntimeException("Colab AI trả về lỗi HTTP " + response.statusCode());
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi kết nối Colab AI: " + e.getMessage());
        }
    }
}
