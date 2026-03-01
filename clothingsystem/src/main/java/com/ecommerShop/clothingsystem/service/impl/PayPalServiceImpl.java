package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.model.Order;
import com.ecommerShop.clothingsystem.service.PayPalService;
import com.paypal.core.PayPalEnvironment;
import com.paypal.core.PayPalHttpClient;
import com.paypal.http.HttpResponse;
import com.paypal.orders.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PayPalServiceImpl implements PayPalService {

    private final PayPalHttpClient client;

    public PayPalServiceImpl(@Value("${PAYPAL_CLIENT_ID}") String clientId,
            @Value("${PAYPAL_CLIENT_SECRET}") String clientSecret,
            @Value("${PAYPAL_MODE}") String mode) {
        String trimmedClientId = clientId != null ? clientId.trim() : "";
        String trimmedSecret = clientSecret != null ? clientSecret.trim() : "";
        String trimmedMode = mode != null ? mode.trim() : "sandbox";

        System.out.println("--- Initializing PayPal Service ---");
        System.out.println("Mode: " + trimmedMode);
        System.out.println(
                "Client ID starts with: " + (trimmedClientId.length() > 4 ? trimmedClientId.substring(0, 4) : "???"));
        System.out
                .println("Secret starts with: " + (trimmedSecret.length() > 4 ? trimmedSecret.substring(0, 4) : "???"));
        System.out.println("Secret length: " + trimmedSecret.length());

        PayPalEnvironment environment = trimmedMode.equals("sandbox")
                ? new PayPalEnvironment.Sandbox(trimmedClientId, trimmedSecret)
                : new PayPalEnvironment.Live(trimmedClientId, trimmedSecret);
        this.client = new PayPalHttpClient(environment);
    }

    @Override
    public String createPaymentUrl(Order order) {
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.checkoutPaymentIntent("CAPTURE");

        List<PurchaseUnitRequest> purchaseUnits = new ArrayList<>();
        purchaseUnits.add(new PurchaseUnitRequest()
                .amountWithBreakdown(new AmountWithBreakdown()
                        .currencyCode("USD")
                        .value(String.format(java.util.Locale.US, "%.2f", order.getTotalPrice()))));
        orderRequest.purchaseUnits(purchaseUnits);

        ApplicationContext applicationContext = new ApplicationContext()
                .returnUrl("http://localhost:8080/api/orders/paypal-success?orderId=" + order.getId())
                .cancelUrl("http://localhost:5173/checkout/payment-result?method=paypal&status=cancel");
        orderRequest.applicationContext(applicationContext);

        OrdersCreateRequest request = new OrdersCreateRequest().requestBody(orderRequest);

        try {
            HttpResponse<com.paypal.orders.Order> response = client.execute(request);
            if (response.statusCode() == 201) {
                return response.result().links().stream()
                        .filter(link -> link.rel().equals("approve"))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("No approval link"))
                        .href();
            } else {
                System.err.println("PayPal Error Status: " + response.statusCode());
                System.err.println("PayPal Error Response: " + response.result());
                throw new RuntimeException("PayPal order creation failed with status: " + response.statusCode());
            }
        } catch (IOException e) {
            System.err.println("PayPal IOException: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("PayPal order creation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean executePayment(String paymentId, String payerId) {
        // In v2 SDK, capture replaces execute
        OrdersCaptureRequest request = new OrdersCaptureRequest(paymentId);
        try {
            HttpResponse<com.paypal.orders.Order> response = client.execute(request);
            return response.result().status().equals("COMPLETED");
        } catch (IOException e) {
            return false;
        }
    }
}
