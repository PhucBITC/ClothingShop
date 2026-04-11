package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.CartDto;
import com.ecommerShop.clothingsystem.dto.CartItemDto;
import com.ecommerShop.clothingsystem.model.*;
import com.ecommerShop.clothingsystem.repository.*;
import com.ecommerShop.clothingsystem.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;


    @Autowired
    private ProductVariantRepository variantRepository;

    @Override
    public CartDto getCart(User user) {
        Cart cart = getOrCreateCart(user);
        return mapToDto(cart);
    }

    @Override
    @Transactional
    public CartDto addToCart(User user, Long variantId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(variantId))
                .findFirst();

        if (existingItem.isPresent()) {
            int newQuantity = existingItem.get().getQuantity() + quantity;
            existingItem.get().setQuantity(Math.min(newQuantity, variant.getStock()));
        } else {
            int finalQuantity = Math.min(quantity, variant.getStock());
            CartItem newItem = new CartItem(cart, variant, finalQuantity);
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        return mapToDto(cart);
    }

    @Override
    @Transactional
    public CartDto updateQuantity(User user, Long variantId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductVariant().getId().equals(variantId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(Math.min(quantity, item.getProductVariant().getStock()));
        }

        cart = cartRepository.save(cart);
        return mapToDto(cart);
    }

    @Override
    @Transactional
    public CartDto removeFromCart(User user, Long variantId) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().removeIf(item -> item.getProductVariant().getId().equals(variantId));
        cart = cartRepository.save(cart);
        return mapToDto(cart);
    }

    @Override
    @Transactional
    public CartDto removeMultipleFromCart(User user, List<Long> variantIds) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().removeIf(item -> variantIds.contains(item.getProductVariant().getId()));
        cart = cartRepository.save(cart);
        return mapToDto(cart);
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public CartDto syncCart(User user, List<CartItemDto> guestItems) {
        Cart cart = getOrCreateCart(user);
        for (CartItemDto guestItem : guestItems) {
            ProductVariant variant = variantRepository.findById(guestItem.getVariantId()).orElse(null);
            if (variant == null)
                continue;

            Optional<CartItem> existingItem = cart.getItems().stream()
                    .filter(item -> item.getProductVariant().getId().equals(guestItem.getVariantId()))
                    .findFirst();

            if (existingItem.isPresent()) {
                int newQuantity = existingItem.get().getQuantity() + guestItem.getQuantity();
                existingItem.get().setQuantity(Math.min(newQuantity, variant.getStock()));
            } else {
                int finalQuantity = Math.min(guestItem.getQuantity(), variant.getStock());
                cart.getItems().add(newItemFromDto(cart, variant, finalQuantity));
            }
        }
        cart = cartRepository.save(cart);
        return mapToDto(cart);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(new Cart(user)));
    }

    private CartItem newItemFromDto(Cart cart, ProductVariant variant, Integer quantity) {
        return new CartItem(cart, variant, quantity);
    }

    private CartDto mapToDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream().map(item -> {
            ProductVariant v = item.getProductVariant();
            Product p = v.getProduct();
            String imageUrl = p.getImages() != null && !p.getImages().isEmpty()
                    ? p.getImages().stream().filter(ProductImage::isPrimary).findFirst()
                            .orElse(p.getImages().get(0)).getImageUrl()
                    : "";

            return new CartItemDto(
                    v.getId(),
                    p.getId(),
                    p.getName(),
                    imageUrl,
                    v.getColor(),
                    v.getSize(),
                    v.getSalePrice() != null ? v.getSalePrice() : v.getPrice(),
                    item.getQuantity());
        }).collect(Collectors.toList());

        double subtotal = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
        int totalItems = items.stream().mapToInt(CartItemDto::getQuantity).sum();

        // Use same logic as frontend for delivery charge for consistency
        double deliveryCharge = 1.50;
        if (items.isEmpty() || subtotal >= 30 || totalItems >= 3) {
            deliveryCharge = 0;
        }

        return new CartDto(items, subtotal, deliveryCharge, subtotal + deliveryCharge);
    }
}
