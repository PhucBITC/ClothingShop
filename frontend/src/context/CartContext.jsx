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
                        quantity: quantity
                    }
                ];
            }
        });
    };

    const removeFromCart = (cartItemId, variantId) => {
        setCartItems((prev) => prev.filter(item => !(item.id === cartItemId && item.variantId === variantId)));
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

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            subtotal
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
