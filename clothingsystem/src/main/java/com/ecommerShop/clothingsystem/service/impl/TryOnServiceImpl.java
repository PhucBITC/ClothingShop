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
import java.util.*;

@Service
public class TryOnServiceImpl implements TryOnService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.tryon.limit:100}")
    private int dailyLimit;

    @Value("${ai.tryon.huggingface.space:yisol/IDM-VTON}")
    private String hfSpace;

    @Value("${ai.tryon.huggingface.token:}")
    private String hfToken;

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

        // Gọi Hugging Face AI (Quy trình 2 bước: Upload -> Inference)
        String resultImageUrl = callHuggingFaceAI(product, request.getUserImage());

        // Tăng đếm lượt thử
        user.setTryOnCount(user.getTryOnCount() + 1);
        user.setLastTryOnDate(LocalDateTime.now());
        userRepository.save(user);

        int remaining = dailyLimit - user.getTryOnCount();
        return new TryOnResponse(resultImageUrl, Math.max(0, remaining), "Ghép ảnh thành công (Miễn phí 100%!)");
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

    // Tải ảnh lên HF để lấy path tạm thời (Gradio 4 yêu cầu)
    private String uploadImageToHF(byte[] bytes, String fileName, String mimeType) throws Exception {
        String boundary = "---" + UUID.randomUUID().toString();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(("--" + boundary + "\r\n").getBytes());
        baos.write(("Content-Disposition: form-data; name=\"files\"; filename=\"" + fileName + "\"\r\n").getBytes());
        baos.write(("Content-Type: " + mimeType + "\r\n\r\n").getBytes());
        baos.write(bytes);
        baos.write(("\r\n--" + boundary + "--\r\n").getBytes());

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://yisol-idm-vton.hf.space/upload"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .header("Authorization", hfToken.isEmpty() ? "" : "Bearer " + hfToken)
                .POST(HttpRequest.BodyPublishers.ofByteArray(baos.toByteArray()))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Lỗi tải ảnh lên HF: " + response.body());
        }

        JsonNode node = objectMapper.readTree(response.body());
        return node.get(0).asText(); // Trả về path dạng: /tmp/gradio/xxx/file.jpg
    }

    private byte[] getProductImageBytes(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty())
            return null;

        try {
            // Trường hợp 1: Nếu là URL tuyệt đối (http/https)
            if (imageUrl.startsWith("http")) {
                System.out.println("Đang tải ảnh sản phẩm từ URL: " + imageUrl);
                HttpClient client = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(15))
                        .build();
                HttpRequest req = HttpRequest.newBuilder().uri(URI.create(imageUrl)).GET().build();
                HttpResponse<byte[]> res = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
                if (res.statusCode() == 200) {
                    return res.body();
                }
            }

            // Trường hợp 2: Nếu là ảnh Local
            String filename = imageUrl;
            if (imageUrl.contains("/uploads/")) {
                filename = imageUrl.substring(imageUrl.indexOf("/uploads/") + 9);
            } else if (imageUrl.startsWith("/")) {
                filename = imageUrl.substring(1);
            }

            System.out.println("Đang đọc ảnh sản phẩm local: " + filename);
            Resource resource = fileStorageService.load(filename);
            if (resource != null && resource.exists()) {
                return StreamUtils.copyToByteArray(resource.getInputStream());
            }
        } catch (Exception e) {
            System.err.println("Lỗi đọc bytes ảnh sản phẩm: " + e.getMessage());
        }
        return null;
    }

    private String callHuggingFaceAI(Product product, MultipartFile imageFile) {
        try {
            String baseUrl = "https://yisol-idm-vton.hf.space";

            // Bước 1: Upload ảnh người dùng
            System.out.println("Đang tải ảnh người dùng lên HF...");
            String humanPath = uploadImageToHF(imageFile.getBytes(), "human.jpg", imageFile.getContentType());

            // Bước 2: Upload ảnh sản phẩm
            System.out.println("Đang tải ảnh sản phẩm lên HF...");
            byte[] productBytes = null;
            if (!product.getImages().isEmpty()) {
                productBytes = getProductImageBytes(product.getImages().get(0).getImageUrl());
            }

            String garmentPath;
            if (productBytes != null) {
                garmentPath = uploadImageToHF(productBytes, "garment.jpg", "image/jpeg");
            } else {
                // Fallback nếu không có ảnh local (rất ít khi xảy ra)
                throw new RuntimeException("Không tìm thấy ảnh sản phẩm để tải lên AI.");
            }

            // Bước 3: Chuẩn bị Payload sử dụng Paths thay vì Base64
            Map<String, Object> humanData = new HashMap<>();
            humanData.put("background",
                    Map.of("path", humanPath, "orig_name", "human.jpg", "size", imageFile.getSize()));
            humanData.put("layers", Collections.emptyList());
            humanData.put("composite", null);

            Map<String, Object> garmentData = Map.of("path", garmentPath, "orig_name", "garment.jpg", "size",
                    productBytes.length);

            List<Object> dataList = new ArrayList<>();
            dataList.add(humanData);
            dataList.add(garmentData);
            dataList.add(product.getName());
            dataList.add(true);
            dataList.add(true);
            dataList.add(30);
            dataList.add(42);

            Map<String, Object> body = Map.of("data", dataList);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(30))
                    .build();

            // Step A: Submit Inference
            HttpRequest submitReq = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/call/tryon"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", hfToken.isEmpty() ? "" : "Bearer " + hfToken)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> submitRes = client.send(submitReq, HttpResponse.BodyHandlers.ofString());
            String eventId = objectMapper.readTree(submitRes.body()).get("event_id").asText();
            System.out.println("Đang xử lý ghép ảnh (Event ID: " + eventId + ")...");

            // Step B: Connect to SSE Stream (Chuẩn Gradio 4)
            System.out.println("Đang kết nối tới hàng đợi AI (SSE Stream)...");
            HttpRequest pollReq = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/call/tryon/" + eventId))
                    .header("Accept", "text/event-stream")
                    .header("Authorization", hfToken.isEmpty() ? "" : "Bearer " + hfToken)
                    .timeout(Duration.ofMinutes(5)) // Chờ tối đa 5 phút cho hàng đợi
                    .GET()
                    .build();

            HttpResponse<java.io.InputStream> pollRes = client.send(pollReq, HttpResponse.BodyHandlers.ofInputStream());
            if (pollRes.statusCode() != 200) {
                throw new RuntimeException("Lỗi kết nối Stream AI: " + pollRes.statusCode());
            }

            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(pollRes.body()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.isEmpty())
                        continue;
                    System.out.println("HF SSE: " + line);

                    if (line.startsWith("event: complete")) {
                        // Tiếp tục đọc dòng data kế tiếp
                        String dataLine = reader.readLine();
                        if (dataLine != null && dataLine.startsWith("data: ")) {
                            String data = dataLine.substring(6).trim();
                            JsonNode node = objectMapper.readTree(data);
                            if (node.isArray() && node.size() > 0 && node.get(0).has("url")) {
                                String relativeUrl = node.get(0).get("url").asText();
                                return relativeUrl.startsWith("http") ? relativeUrl : baseUrl + "/file=" + relativeUrl;
                            }
                        }
                    } else if (line.contains("event: error")) {
                        throw new RuntimeException("AI Hugging Face báo lỗi xử lý khi đang trong hàng đợi.");
                    } else if (line.contains("event: heartbeat")) {
                        System.out.println("Hệ thống đang giữ kết nối (Heartbeat)...");
                    }
                }
            }

            throw new RuntimeException("Kết nối với AI bị ngắt đột ngột (End of Stream).");

        } catch (Exception e) {
            System.err.println("LỖI AI TRUNG GIAN: " + e.getMessage());
            throw new RuntimeException("Lỗi hệ thống ghép ảnh: " + e.getMessage());
        }
    }
}
