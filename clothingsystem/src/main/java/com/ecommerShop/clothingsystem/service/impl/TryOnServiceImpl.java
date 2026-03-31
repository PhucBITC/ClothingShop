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

    // API Settings cho FitRoom.app
    @Value("${ai.tryon.limit:100}")
    private int dailyLimit;

    @Value("${fitroom.api.key:}")
    private String fitRoomApiKey;

    @Value("${fitroom.api.base-url:https://platform.fitroom.app/api/tryon/v2}")
    private String fitRoomBaseUrl;

    @Value("${fitroom.api.poll-interval:5000}")
    private int pollInterval;

    @Value("${fitroom.api.timeout-minutes:2}")
    private int timeoutMinutes;

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

        if (fitRoomApiKey == null || fitRoomApiKey.isBlank() || fitRoomApiKey.equals("YOUR_FITROOM_API_KEY_HERE")) {
            throw new RuntimeException(
                    "FitRoom API Key not configured. Please check application.properties!");
        }

        // Call FitRoom API
        String resultImageUrl = callFitRoomAPI(product, request.getUserImage());

        // Update counts logic
        if (user.getTryOnCount() < dailyLimit) {
            // Use daily free limit
            user.setTryOnCount(user.getTryOnCount() + 1);
        } else if (user.getPurchasedCredits() > 0) {
            // Use purchased credits
            user.setPurchasedCredits(user.getPurchasedCredits() - 1);
        }
        
        user.setLastTryOnDate(LocalDateTime.now());
        userRepository.save(user);

        int remainingFree = Math.max(0, dailyLimit - user.getTryOnCount());
        int totalRemaining = remainingFree + user.getPurchasedCredits();
        
        return new TryOnResponse(resultImageUrl, totalRemaining, "Try-On completed successfully!");
    }

    private void validateRateLimit(User user) {
        if (user.getLastTryOnDate() != null) {
            LocalDate lastDate = user.getLastTryOnDate().toLocalDate();
            if (!lastDate.equals(LocalDate.now())) {
                user.setTryOnCount(0);
                userRepository.save(user);
            }
        }
        
        // If daily free limit reached AND no purchased credits
        if (user.getTryOnCount() >= dailyLimit && user.getPurchasedCredits() <= 0) {
            throw new RuntimeException("LIMIT_REACHED: You have used all your free tries for today.");
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

    private String mapClothType(Product product) {
        if (product.getCategory() == null)
            return "upper";
        String catName = product.getCategory().getName().toLowerCase();
        System.out.println("Mapping category: " + catName);

        if (catName.contains("áo") || catName.contains("shirt") || catName.contains("top") || catName.contains("vest")) {
            return "upper";
        }
        if (catName.contains("quần") || catName.contains("pant") || catName.contains("jean") || catName.contains("short")
                || catName.contains("váy ngắn") || catName.contains("skirt")) {
            return "lower";
        }
        if (catName.contains("đầm") || catName.contains("váy dài") || catName.contains("dress")
                || catName.contains("jumpsuit")) {
            return "full_set";
        }
        return "upper"; // Mặc định
    }

    private String translateError(String errorMsg) {
        if (errorMsg == null)
            return "Unknown error from AI server.";
        String lower = errorMsg.toLowerCase();

        if (lower.contains("no person") || lower.contains("person not found")) {
            return "No person detected in the image. Please upload a clear photo showing your body.";
        }
        if (lower.contains("cloth not found") || lower.contains("garment not found")) {
            return "Could not detect the clothing item. Please try with another product.";
        }
        if (lower.contains("insufficient") || lower.contains("credit")) {
            return "The AI system is currently out of credits. Please contact the administrator.";
        }
        if (lower.contains("invalid cloth_type")) {
            return "This product type is not yet supported for AI try-on.";
        }
        if (lower.contains("body part") || lower.contains("missing")) {
            return "The image is missing necessary body parts (e.g., missing legs for pants). Please provide a more complete photo.";
        }

        return "AI Server Error: " + errorMsg;
    }

    private String callFitRoomAPI(Product product, MultipartFile imageFile) {
        try {
            System.out.println("--- Starting FitRoom AI Try-On Process ---");

            // 1. Create Task (POST /tasks)
            String taskId = createFitRoomTask(product, imageFile);
            System.out.println("Task created with ID: " + taskId);

            // 2. Polling Loop
            long startTime = System.currentTimeMillis();
            long maxDuration = (long) timeoutMinutes * 60 * 1000;

            while (System.currentTimeMillis() - startTime < maxDuration) {
                Thread.sleep(pollInterval);
                System.out.println("Checking Task Status: " + taskId + "...");

                JsonNode statusNode = getFitRoomTaskStatus(taskId);
                String status = statusNode.get("status").asText();

                if ("COMPLETED".equalsIgnoreCase(status)) {
                    String resultUrl = statusNode.get("download_signed_url").asText();
                    System.out.println("--- Try-On SUCCESS! ---");
                    return resultUrl;
                } else if ("FAILED".equalsIgnoreCase(status)) {
                    String error = statusNode.has("error_message") ? statusNode.get("error_message").asText() : "FAILED";
                    throw new RuntimeException(translateError(error));
                }
            }

            throw new RuntimeException("Wait time exceeded (Timeout). Please try again later.");

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Process interrupted.");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("FitRoom API Connection Error: " + e.getMessage());
        }
    }

    private String createFitRoomTask(Product product, MultipartFile imageFile) throws Exception {
        byte[] productBytes = null;
        if (!product.getImages().isEmpty()) {
            productBytes = getProductImageBytes(product.getImages().get(0).getImageUrl());
        }
        if (productBytes == null) {
            throw new RuntimeException("Could not find product image for try-on.");
        }

        String clothType = mapClothType(product);
        String boundary = "boundary-" + UUID.randomUUID();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // Part 1: model_image
        baos.write(("--" + boundary + "\r\n").getBytes());
        baos.write(("Content-Disposition: form-data; name=\"model_image\"; filename=\"model.jpg\"\r\n").getBytes());
        baos.write(("Content-Type: " + imageFile.getContentType() + "\r\n\r\n").getBytes());
        baos.write(imageFile.getBytes());
        baos.write("\r\n".getBytes());

        // Part 2: cloth_image
        baos.write(("--" + boundary + "\r\n").getBytes());
        baos.write(("Content-Disposition: form-data; name=\"cloth_image\"; filename=\"cloth.jpg\"\r\n").getBytes());
        baos.write("Content-Type: image/jpeg\r\n\r\n".getBytes());
        baos.write(productBytes);
        baos.write("\r\n".getBytes());

        // Part 3: cloth_type
        baos.write(("--" + boundary + "\r\n").getBytes());
        baos.write("Content-Disposition: form-data; name=\"cloth_type\"\r\n\r\n".getBytes());
        baos.write(clothType.getBytes());
        baos.write("\r\n".getBytes());

        // Part 4: hd_mode (tùy chọn, mặc định true cho đẹp)
        baos.write(("--" + boundary + "\r\n").getBytes());
        baos.write("Content-Disposition: form-data; name=\"hd_mode\"\r\n\r\n".getBytes());
        baos.write("true".getBytes());
        baos.write(("\r\n--" + boundary + "--\r\n").getBytes());

        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(fitRoomBaseUrl + "/tasks"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .header("X-API-KEY", fitRoomApiKey)
                .POST(HttpRequest.BodyPublishers.ofByteArray(baos.toByteArray()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 201 || response.statusCode() == 200) {
            JsonNode json = objectMapper.readTree(response.body());
            return json.get("task_id").asText();
        } else if (response.statusCode() == 402) {
            throw new RuntimeException("FitRoom account out of credits.");
        } else {
            throw new RuntimeException("FitRoom Task creation failed (HTTP " + response.statusCode() + "): " + response.body());
        }
    }

    private JsonNode getFitRoomTaskStatus(String taskId) throws Exception {
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(fitRoomBaseUrl + "/tasks/" + taskId))
                .header("X-API-KEY", fitRoomApiKey)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return objectMapper.readTree(response.body());
        } else {
            throw new RuntimeException("Error checking task status: HTTP " + response.statusCode());
        }
    }
}
