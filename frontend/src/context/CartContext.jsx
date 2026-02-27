import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, variant, quantity = 1) => {
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
                        weight: product.weight || 0, // Store weight per unit
                        quantity: quantity
                    }
                ];
            }
        });
    };

    const removeFromCart = (cartItemId, variantId) => {
        setCartItems((prev) => prev.filter(item => !(item.id === cartItemId && item.variantId === variantId)));
    };

    const removeMultipleFromCart = (itemsToRemove) => {
        // itemsToRemove is an array of {id, variantId}
        setCartItems((prev) =>
            prev.filter(item =>
                !itemsToRemove.some(rem => rem.id === item.id && rem.variantId === item.variantId)
            )
        );
    };

    const updateQuantity = (cartItemId, variantId, delta) => {
        setCartItems((prev) =>
            prev.map(item => {
                if (item.id === cartItemId && item.variantId === variantId) {
                    return { ...item, quantity: Math.max(1, item.quantity + delta) };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
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
