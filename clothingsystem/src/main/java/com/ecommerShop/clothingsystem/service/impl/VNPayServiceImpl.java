package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayServiceImpl implements VNPayService {

    @Value("${VNP_TMN_CODE}")
    private String tmnCode;

    @Value("${VNP_HASH_SECRET}")
    private String hashSecret;

    @Value("${VNP_PAY_URL}")
    private String vnpPayUrl;

    @Value("${VNP_RETURN_URL}")
    private String vnpReturnUrl;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (tmnCode != null)
            tmnCode = tmnCode.trim();
        if (hashSecret != null)
            hashSecret = hashSecret.trim();
        if (vnpPayUrl != null)
            vnpPayUrl = vnpPayUrl.trim();
        if (vnpReturnUrl != null)
            vnpReturnUrl = vnpReturnUrl.trim();
    }

    @Override
    public String createPaymentUrl(Long orderId, double amount, HttpServletRequest request) {
        // Convert to VND if it's USD (assuming amount < 1000 means it's likely USD)
        // You can adjust this logic based on your currency needs
        long vnp_AmountLong = (long) (amount * 25000 * 100); // Multiply by 25k and then 100 for VNPay subunit

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = orderId.toString();
        String vnp_IpAddr = getIpAddress(request);
        if (vnp_IpAddr.contains(":"))
            vnp_IpAddr = "127.0.0.1"; // Fix for IPv6 localhost

        String vnp_TmnCode = tmnCode;
        String vnp_OrderInfo = "Payment" + orderId;
        String vnp_OrderType = "other";
        String vnp_Locale = "en";

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnp_AmountLong));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", vnpReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sort keys
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                String encodedFieldValue = urlEncode(fieldValue);

                if (hashData.length() > 0) {
                    hashData.append('&');
                    query.append('&');
                }

                hashData.append(fieldName).append('=').append(encodedFieldValue);
                query.append(urlEncode(fieldName)).append('=').append(encodedFieldValue);
            }
        }

        String hashDataStr = hashData.toString();
        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(hashSecret, hashDataStr);
        String finalUrl = vnpPayUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

        System.out.println("--- VNPay Security Debug ---");
        System.out.println("TmnCode: " + tmnCode);
        System.out.println("Hash Secret Length: " + (hashSecret != null ? hashSecret.length() : 0));
        System.out.println("Hash Data String: [" + hashDataStr + "]");
        System.out.println("Final URL: " + finalUrl);

        return finalUrl;
    }

    private String urlEncode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString()).replace("+", "%20");
        } catch (Exception e) {
            return value;
        }
    }

    @Override
    public int orderReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String signValue = hashAllFields(fields);
        if (signValue.equalsIgnoreCase(vnp_SecureHash)) {
            if ("00".equals(request.getParameter("vnp_ResponseCode"))) {
                return 1; // Success
            } else {
                return 0; // Fail
            }
        } else {
            return -1; // Invalid signature
        }
    }

    private String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName);
                sb.append("=");
                sb.append(urlEncode(fieldValue));
                if (itr.hasNext()) {
                    sb.append("&");
                }
            }
        }
        return hmacSHA512(hashSecret, sb.toString());
    }

    private String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }
}
