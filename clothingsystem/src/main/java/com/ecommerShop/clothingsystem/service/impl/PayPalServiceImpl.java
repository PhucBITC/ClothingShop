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
        PayPalEnvironment environment = mode.equals("sandbox") ? new PayPalEnvironment.Sandbox(clientId, clientSecret)
                : new PayPalEnvironment.Live(clientId, clientSecret);
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
                        .value(String.format("%.2f", order.getTotalPrice()))));
        orderRequest.purchaseUnits(purchaseUnits);

        ApplicationContext applicationContext = new ApplicationContext()
                .returnUrl("http://localhost:5173/checkout/payment-result?method=paypal")
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
            }
        } catch (IOException e) {
            throw new RuntimeException("PayPal order creation failed", e);
        }
        return null;
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
