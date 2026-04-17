package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.model.*;
import com.ecommerShop.clothingsystem.repository.*;
import com.ecommerShop.clothingsystem.service.CartService;
import com.ecommerShop.clothingsystem.service.OrderService;
import com.ecommerShop.clothingsystem.service.NotificationService;
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
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ShippingAddressRepository addressRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.ecommerShop.clothingsystem.service.DiscountService discountService;

    @Override
    @Transactional
    public Order createOrder(User user, Long addressId, String paymentMethod, String discountCode) {
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

        // 3. Calculate Subtotal
        double subtotal = cart.getItems().stream()
                .mapToDouble(item -> {
                    ProductVariant v = item.getProductVariant();
                    double price = v.getSalePrice() != null ? v.getSalePrice() : v.getPrice();
                    return price * item.getQuantity();
                }).sum();

        // Delivery charge logic (matching CartServiceImpl/Frontend)
        int totalItemsCount = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        double deliveryCharge = (subtotal >= 30 || totalItemsCount >= 3) ? 0 : 1.50;

        // 4. Handle Discount
        double discountAmount = 0;
        Discount appliedDiscount = null;
        if (discountCode != null && !discountCode.trim().isEmpty()) {
            appliedDiscount = discountService.validateDiscount(discountCode.trim(), subtotal);
            if (appliedDiscount.getType() == DiscountType.PERCENTAGE) {
                discountAmount = subtotal * (appliedDiscount.getValue() / 100.0);
                if (appliedDiscount.getMaxDiscountAmount() != null && discountAmount > appliedDiscount.getMaxDiscountAmount()) {
                    discountAmount = appliedDiscount.getMaxDiscountAmount();
                }
            } else {
                discountAmount = appliedDiscount.getValue();
            }
            // Ensure discount doesn't exceed subtotal
            if (discountAmount > subtotal) {
                discountAmount = subtotal;
            }
        }

        double totalPrice = subtotal + deliveryCharge - discountAmount;

        // 5. Create Order
        Order order = new Order();
        order.setUser(user);
        order.setReceiverName(address.getFullName());
        order.setReceiverPhone(address.getPhone());
        order.setShippingAddress(address.getStreetAddress() + ", " + address.getWard() + ", " + address.getDistrict()
                + ", " + address.getProvince());
        
        order.setSubtotal(subtotal);
        order.setDeliveryCharge(deliveryCharge);
        order.setDiscountCode(appliedDiscount != null ? appliedDiscount.getCode() : null);
        order.setDiscountAmount(discountAmount);
        order.setTotalPrice(totalPrice);
        
        order.setStatus("PENDING");
        order.setOrderCode(generateOrderCode());

        order = orderRepository.save(order);

        // 6. Create Order Items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            ProductVariant v = cartItem.getProductVariant();
            double price = v.getSalePrice() != null ? v.getSalePrice() : v.getPrice();
            OrderItem orderItem = new OrderItem(order, v, price, cartItem.getQuantity());
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);
        order.setItems(orderItems);

        // 7. Increment Discount Usage
        if (appliedDiscount != null) {
            discountService.incrementUsageCount(appliedDiscount.getId());
        }

        // 8. Create Payment Record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("PENDING");
        paymentRepository.save(payment);
        order.setPayment(payment);

        // 9. Clear Cart ONLY for COD (online payments clear after success)
        System.out.println("Processing order with total price: " + totalPrice + " for payment method: " + paymentMethod);
        if ("COD".equalsIgnoreCase(paymentMethod)) {
            System.out.println("Clearing cart for COD order");
            cartService.clearCart(user);

            // Decrement stock for COD
            decrementStock(order);

            // Trigger Notification for COD
            notificationService.createNotification(
                    user,
                    "Order Placed Successfully",
                    "Your order " + order.getOrderCode() + " has been placed. Final amount: $" + String.format("%.2f", totalPrice) + ". Payment will be collected upon delivery.",
                    Notification.NotificationType.ORDER,
                    true);
        } else {
            System.out.println("Cart will be cleared after successful online payment");
            // Add a "Processing Payment" notification for immediate feedback
            notificationService.createNotification(
                    user,
                    "Order Pending Payment",
                    "Your order " + order.getOrderCode()
                            + " has been placed. Please complete the payment of $" + String.format("%.2f", totalPrice) + " to process it.",
                    Notification.NotificationType.ORDER,
                    false); // No email yet, wait for success
        }

        return order;
    }

    @Override
    public List<Order> getMyOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
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
        return orderRepository.findAllByOrderByCreatedAtDesc();
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

        // Trigger Notification on status change
        notificationService.createNotification(
                order.getUser(),
                "Order Status Updated",
                "Your order " + order.getOrderCode() + " is now " + status + ".",
                Notification.NotificationType.ORDER,
                true);
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

        // Decrement stock for Online Payment
        decrementStock(order);

        // Clear cart for online payments now that it's successful
        cartService.clearCart(order.getUser());

        // Trigger Notification for Payment Success
        notificationService.createNotification(
                order.getUser(),
                "Payment Successful",
                "Payment for order " + order.getOrderCode() + " has been received successfully.",
                Notification.NotificationType.ORDER,
                true);
    }

    @Transactional
    protected void decrementStock(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getProductVariant();
            int orderQty = item.getQuantity();

            // Atomic decrement: only succeeds if stock >= orderQty
            int updatedRows = productVariantRepository.decrementStock(variant.getId(), orderQty);
            
            if (updatedRows == 0) {
                // If 0 rows updated, it means stock was insufficient at the moment of execution
                throw new RuntimeException("Insufficient stock for variant: " + variant.getSku() + 
                                           " (Available stock may have changed by another order)");
            }

            System.out.println("Successfully decremented stock for " + variant.getSku() + " by " + orderQty);
        }
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
        List<Order> orders = orderRepository.findAll();
        boolean changed = false;

        for (Order order : orders) {
            boolean orderChanged = false;
            
            // 1. Order Code
            if (order.getOrderCode() == null) {
                order.setOrderCode(generateOrderCode());
                orderChanged = true;
            }

            // 2. New Discount Fields
            if (order.getSubtotal() == null) {
                // Approximate subtotal from totalPrice if items are not available or for simplicity
                order.setSubtotal(order.getTotalPrice());
                orderChanged = true;
            }
            if (order.getDeliveryCharge() == null) {
                order.setDeliveryCharge(0.0);
                orderChanged = true;
            }
            if (order.getDiscountAmount() == null) {
                order.setDiscountAmount(0.0);
                orderChanged = true;
            }

            if (orderChanged) {
                changed = true;
            }
        }

        if (changed) {
            System.out.println("Migrated orders to include new fields (order_code, subtotal, etc.)");
            orderRepository.saveAll(orders);
        }
    }
}
