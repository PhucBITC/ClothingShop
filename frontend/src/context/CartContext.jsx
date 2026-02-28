import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    // Check login status periodically or when token changes manually
    useEffect(() => {
        const checkLogin = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };
        window.addEventListener('storage', checkLogin);
        return () => window.removeEventListener('storage', checkLogin);
    }, []);

    const fetchCart = useCallback(async () => {
        try {
            const response = await axios.get('/cart');
            setCartItems(response.data.items.map(item => ({
                id: item.productId,
                variantId: item.variantId,
                name: item.productName,
                price: item.price,
                image: item.imageUrl,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                // Weight is not stored in backend DTO yet, adding default or from product if needed
                weight: 0
            })));
        } catch (error) {
            console.error("Error fetching cart from backend:", error);
        }
    }, []);

    const syncCartWithBackend = useCallback(async (localItems) => {
        try {
            const guestItems = localItems.map(item => ({
                variantId: item.variantId,
                productId: item.id,
                productName: item.name,
                imageUrl: item.image,
                color: item.color,
                size: item.size,
                price: item.price,
                quantity: item.quantity
            }));
            const response = await axios.post('/cart/sync', guestItems);
            setCartItems(response.data.items.map(item => ({
                id: item.productId,
                variantId: item.variantId,
                name: item.productName,
                price: item.price,
                image: item.imageUrl,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                weight: 0
            })));
            localStorage.removeItem('cart'); // Clear local cart after sync
        } catch (error) {
            console.error("Error syncing cart:", error);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
            if (localItems.length > 0) {
                syncCartWithBackend(localItems);
            } else {
                fetchCart();
            }
        }
    }, [isLoggedIn, fetchCart, syncCartWithBackend]);

    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isLoggedIn]);

    const addToCart = async (product, variant, quantity = 1) => {
        if (isLoggedIn) {
            try {
                const response = await axios.post('/cart/add', {
                    variantId: variant.id,
                    quantity: quantity
                });
                // Update local state from backend response
                setCartItems(response.data.items.map(item => ({
                    id: item.productId,
                    variantId: item.variantId,
                    name: item.productName,
                    price: item.price,
                    image: item.imageUrl,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity,
                    weight: 0
                })));
            } catch (error) {
                console.error("Error adding to cart:", error);
            }
        } else {
            setCartItems((prev) => {
                const existingIdx = prev.findIndex(
                    (item) => item.id === product.id && item.variantId === variant.id
                );

                if (existingIdx > -1) {
                    const updatedItems = [...prev];
                    updatedItems[existingIdx].quantity += quantity;
                    return updatedItems;
                } else {
                    return [
                        ...prev,
                        {
                            id: product.id,
                            variantId: variant.id,
                            name: product.name,
                            price: variant.salePrice || variant.price || product.basePrice,
                            image: product.images?.find(img => img.primary)?.imageUrl || product.images?.[0]?.imageUrl || '',
                            color: variant.color,
                            size: variant.size,
                            weight: product.weight || 0,
                            quantity: quantity
                        }
                    ];
                }
            });
        }
    };

    const removeFromCart = async (cartItemId, variantId) => {
        if (isLoggedIn) {
            try {
                const response = await axios.delete(`/cart/remove/${variantId}`);
                setCartItems(response.data.items.map(item => ({
                    id: item.productId,
                    variantId: item.variantId,
                    name: item.productName,
                    price: item.price,
                    image: item.imageUrl,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity,
                    weight: 0
                })));
            } catch (error) {
                console.error("Error removing from cart:", error);
            }
        } else {
            setCartItems((prev) => prev.filter(item => !(item.id === cartItemId && item.variantId === variantId)));
        }
    };

    const removeMultipleFromCart = async (itemsToRemove) => {
        if (isLoggedIn) {
            try {
                const variantIds = itemsToRemove.map(item => item.variantId);
                const response = await axios.delete('/cart/remove-multiple', { data: variantIds });
                setCartItems(response.data.items.map(item => ({
                    id: item.productId,
                    variantId: item.variantId,
                    name: item.productName,
                    price: item.price,
                    image: item.imageUrl,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity,
                    weight: 0
                })));
            } catch (error) {
                console.error("Error removing multiple from cart:", error);
            }
        } else {
            setCartItems((prev) =>
                prev.filter(item =>
                    !itemsToRemove.some(rem => rem.id === item.id && rem.variantId === item.variantId)
                )
            );
        }
    };

    const updateQuantity = async (cartItemId, variantId, delta) => {
        if (isLoggedIn) {
            try {
                const currentItem = cartItems.find(i => i.variantId === variantId);
                const newQuantity = Math.max(1, (currentItem?.quantity || 0) + delta);
                const response = await axios.put('/cart/update', {
                    variantId: variantId,
                    quantity: newQuantity
                });
                setCartItems(response.data.items.map(item => ({
                    id: item.productId,
                    variantId: item.variantId,
                    name: item.productName,
                    price: item.price,
                    image: item.imageUrl,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity,
                    weight: 0
                })));
            } catch (error) {
                console.error("Error updating quantity:", error);
            }
        } else {
            setCartItems((prev) =>
                prev.map(item => {
                    if (item.id === cartItemId && item.variantId === variantId) {
                        return { ...item, quantity: Math.max(1, item.quantity + delta) };
                    }
                    return item;
                })
            );
        }
    };

    const clearCart = async () => {
        if (isLoggedIn) {
            try {
                await axios.delete('/cart/clear');
                setCartItems([]);
            } catch (error) {
                console.error("Error clearing cart:", error);
            }
        } else {
            setCartItems([]);
        }
    };

    const calculateTotals = (items) => {
        const itemSubtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
        const itemWeight = items.reduce((acc, item) => acc + (item.weight * item.quantity), 0);

        let charge = 1.50;
        if (items.length === 0) {
            charge = 0;
        } else if (itemSubtotal >= 30 || itemCount >= 3) {
            charge = 0;
        } else if (itemWeight > 2000) {
            const extraWeight = itemWeight - 2000;
            charge += Math.ceil(extraWeight / 1000) * 1.00;
        }

        return {
            subtotal: itemSubtotal,
            deliveryCharge: charge,
            total: itemSubtotal + charge
        };
    };

    const { subtotal, deliveryCharge, total } = calculateTotals(cartItems);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            removeMultipleFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            subtotal,
            deliveryCharge,
            total,
            calculateTotals
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
