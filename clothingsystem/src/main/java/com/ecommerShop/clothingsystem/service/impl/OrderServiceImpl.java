package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.model.*;
import com.ecommerShop.clothingsystem.repository.*;
import com.ecommerShop.clothingsystem.service.CartService;
import com.ecommerShop.clothingsystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ShippingAddressRepository addressRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CartService cartService;

    @Override
    @Transactional
    public Order createOrder(User user, Long addressId, String paymentMethod) {
        // 1. Get Cart
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            System.err.println("Checkout failed: Cart is empty for user " + user.getId());
            throw new RuntimeException("Cart is empty");
        }
        System.out.println("Cart has " + cart.getItems().size() + " items for user " + user.getId());

        // 2. Get Shipping Address
        ShippingAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // 3. Calculate Total Price
        double subtotal = cart.getItems().stream()
                .mapToDouble(item -> {
                    ProductVariant v = item.getProductVariant();
                    double price = v.getSalePrice() != null ? v.getSalePrice() : v.getPrice();
                    return price * item.getQuantity();
                }).sum();

        // Delivery charge logic (matching CartServiceImpl/Frontend)
        int totalItemsCount = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        double deliveryCharge = (subtotal >= 30 || totalItemsCount >= 3) ? 0 : 1.50;
        double totalPrice = subtotal + deliveryCharge;

        // 4. Create Order
        Order order = new Order();
        order.setUser(user);
        order.setReceiverName(address.getFullName());
        order.setReceiverPhone(address.getPhone());
        order.setShippingAddress(address.getStreetAddress() + ", " + address.getWard() + ", " + address.getDistrict()
                + ", " + address.getProvince());
        order.setTotalPrice(totalPrice);
        order.setStatus("PENDING");
        order.setOrderCode(generateOrderCode());

        order = orderRepository.save(order);

        // 5. Create Order Items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            ProductVariant v = cartItem.getProductVariant();
            double price = v.getSalePrice() != null ? v.getSalePrice() : v.getPrice();
            OrderItem orderItem = new OrderItem(order, v, price, cartItem.getQuantity());
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);
        order.setItems(orderItems);

        // 6. Create Payment Record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("PENDING");
        paymentRepository.save(payment);
        order.setPayment(payment);

        // 7. Clear Cart ONLY for COD (online payments clear after success)
        System.out.println("Processing order for payment method: " + paymentMethod);
        if ("COD".equalsIgnoreCase(paymentMethod)) {
            System.out.println("Clearing cart for COD order");
            cartService.clearCart(user);
        } else {
            System.out.println("Cart will be cleared after successful online payment");
        }

        return order;
    }

    @Override
    public List<Order> getMyOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    public Order getOrderById(Long id, User user) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Basic security check
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        return order;
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        orderRepository.delete(order);
    }

    @Override
    @Transactional
    public void deleteOrders(List<Long> ids) {
        orderRepository.deleteAllById(ids);
    }

    @Override
    @Transactional
    public void handlePaymentSuccess(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus("CONFIRMED");
        orderRepository.save(order);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setPaymentStatus("COMPLETED");
        paymentRepository.save(payment);

        // Clear cart for online payments now that it's successful
        cartService.clearCart(order.getUser());
    }

    // --- Helpers & Migration ---

    private String generateOrderCode() {
        String datePart = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")
                .format(java.time.LocalDateTime.now());
        String code;
        do {
            String randomPart = java.util.UUID.randomUUID().toString().substring(0, 5).toUpperCase();
            code = "ORD-" + datePart + "-" + randomPart;
        } while (orderRepository.existsByOrderCode(code));
        return code;
    }

    @jakarta.annotation.PostConstruct
    @Transactional
    public void migrateExistingOrders() {
        List<Order> ordersWithoutCode = orderRepository.findAll().stream()
                .filter(o -> o.getOrderCode() == null)
                .collect(java.util.stream.Collectors.toList());

        if (!ordersWithoutCode.isEmpty()) {
            System.out.println("Migrating " + ordersWithoutCode.size() + " orders to add order codes...");
            for (Order order : ordersWithoutCode) {
                order.setOrderCode(generateOrderCode());
            }
            orderRepository.saveAll(ordersWithoutCode);
        }
    }
}
