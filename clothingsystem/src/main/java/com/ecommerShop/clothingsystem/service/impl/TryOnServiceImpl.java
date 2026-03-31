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
                    "FitRoom API Key chưa được cấu hình. Vui lòng kiểm tra file application.properties!");
        }

        // Gọi FitRoom API (Mới)
        String resultImageUrl = callFitRoomAPI(product, request.getUserImage());

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

    private String mapClothType(Product product) {
        if (product.getCategory() == null)
            return "upper";
        String catName = product.getCategory().getName().toLowerCase();
        System.out.println("Đang mapping cho category: " + catName);

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
            return "Lỗi không xác định từ máy chủ AI.";
        String lower = errorMsg.toLowerCase();

        if (lower.contains("no person") || lower.contains("person not found")) {
            return "Không tìm thấy người trong ảnh. Vui lòng chụp rõ khuôn mặt và cơ thể của bạn.";
        }
        if (lower.contains("cloth not found") || lower.contains("garment not found")) {
            return "Không nhận diện được sản phẩm quần áo. Vui lòng thử lại với sản phẩm khác.";
        }
        if (lower.contains("insufficient") || lower.contains("credit")) {
            return "Hệ thống đang bảo trì hạn mức (Hết Credits). Vui lòng liên hệ Admin!";
        }
        if (lower.contains("invalid cloth_type")) {
            return "Sản phẩm này hiện chưa hỗ trợ thử đồ AI (Loại trang phục không khớp).";
        }
        if (lower.contains("body part") || lower.contains("missing")) {
            return "Ảnh của bạn bị thiếu bộ phận cơ thể cần thiết (ví dụ: thiếu chân khi thử quần). Vui lòng chụp đầy đủ hơn.";
        }

        return "Máy chủ AI báo lỗi: " + errorMsg;
    }

    private String callFitRoomAPI(Product product, MultipartFile imageFile) {
        try {
            System.out.println("--- Bắt đầu quy trình Thử đồ AI với FitRoom ---");

            // 1. Tạo Task (POST /tasks)
            String taskId = createFitRoomTask(product, imageFile);
            System.out.println("Đã tạo Task ID: " + taskId);

            // 2. Polling Loop để lấy kết quả
            long startTime = System.currentTimeMillis();
            long maxDuration = (long) timeoutMinutes * 60 * 1000;

            while (System.currentTimeMillis() - startTime < maxDuration) {
                Thread.sleep(pollInterval);
                System.out.println("Đang kiểm tra trạng thái Task: " + taskId + "...");

                JsonNode statusNode = getFitRoomTaskStatus(taskId);
                String status = statusNode.get("status").asText();

                if ("COMPLETED".equalsIgnoreCase(status)) {
                    String resultUrl = statusNode.get("download_signed_url").asText();
                    System.out.println("--- Thử đồ THÀNH CÔNG! ---");
                    return resultUrl;
                } else if ("FAILED".equalsIgnoreCase(status)) {
                    String error = statusNode.has("error_message") ? statusNode.get("error_message").asText() : "FAILED";
                    throw new RuntimeException(translateError(error));
                }

                // Nếu vẫn đang CREATED hoặc PROCESSING thì tiếp tục đợi
            }

            throw new RuntimeException("Hết thời gian chờ (Timeout). Vui lòng thử lại sau ít phút!");

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Tiến trình bị gián đoạn.");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi kết nối FitRoom API: " + e.getMessage());
        }
    }

    private String createFitRoomTask(Product product, MultipartFile imageFile) throws Exception {
        byte[] productBytes = null;
        if (!product.getImages().isEmpty()) {
            productBytes = getProductImageBytes(product.getImages().get(0).getImageUrl());
        }
        if (productBytes == null) {
            throw new RuntimeException("Không tìm thấy ảnh sản phẩm để thử.");
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
            throw new RuntimeException("Tài khoản FitRoom hết lượt thử (Credits).");
        } else {
            throw new RuntimeException("Lỗi tạo Task FitRoom (HTTP " + response.statusCode() + "): " + response.body());
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
            throw new RuntimeException("Lỗi kiểm tra trạng thái Task: HTTP " + response.statusCode());
        }
    }
}
