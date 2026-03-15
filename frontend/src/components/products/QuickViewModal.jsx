import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiX, BiMinus, BiPlus, BiCartAlt, BiCheck } from 'react-icons/bi';
import { useCart } from '../../context/CartContext';
import { useToast } from '../common/toast/ToastContext';
import styles from './QuickViewModal.module.css';

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart();
    const toast = useToast();

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');

    // Pre-select first available variant
    useEffect(() => {
        if (product && product.variants?.length > 0) {
            const firstAvailable = product.variants.find(v => v.stock > 0) || product.variants[0];
            setSelectedColor(firstAvailable.color);
            setSelectedSize(firstAvailable.size);
            
            if (product.images?.length > 0) {
                const primary = product.images.find(img => img.primary) || product.images[0];
                setActiveImage(primary.imageUrl);
            }
        }
    }, [product]);

    if (!product) return null;

    const getFullImageUrl = (url) => {
        if (!url) return 'https://placehold.co/400x533?text=No+Image';
        if (url.startsWith('http')) return url;
        return `http://localhost:8080/api/files/${url.startsWith('/') ? url.substring(1) : url}`;
    };

    const availableColors = [...new Set(product.variants?.map(v => v.color))];
    const availableSizes = [...new Set(product.variants?.filter(v => v.color === selectedColor).map(v => v.size))];

    const currentVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
    const stockCount = currentVariant?.stock || 0;
    const price = currentVariant?.price || product.basePrice;
    const salePrice = currentVariant?.salePrice;

    const handleQuantityChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setQuantity('');
            return;
        }
        
        const num = parseInt(val);
        if (isNaN(num) || num < 1) {
            return;
        }
        
        if (num > stockCount) {
            toast.warning("Stock Limit", `The requested quantity exceeds stock. Only ${stockCount} items available.`);
            setQuantity(stockCount);
            return;
        }
        
        setQuantity(num);
    };

    const handleBlur = () => {
        if (quantity === '' || quantity < 1) {
            setQuantity(1);
        }
    };

    const handleAddToCart = () => {
        const finalQty = parseInt(quantity);
        if (isNaN(finalQty) || finalQty < 1) {
            toast.error("Invalid Quantity", "Please enter a valid quantity.");
            return;
        }
        if (!selectedColor || !selectedSize) {
            toast.error("Required", "Please select color and size.");
            return;
        }
        if (finalQty > stockCount) {
            toast.error("Stock Error", `Requested quantity exceeds stock. Only ${stockCount} items left.`);
            setQuantity(stockCount);
            return;
        }
        if (stockCount <= 0) {
            toast.error("Unavailable", "This selection is out of stock.");
            return;
        }

        addToCart(product, currentVariant, finalQty);
        toast.success("Success", `${product.name} added to cart.`);
        onClose();
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={onClose}>
                    <motion.div 
                        className={styles.modal} 
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                            <BiX size={24} />
                        </button>

                        <div className={styles.container}>
                            {/* Left: Product Images */}
                            <div className={styles.gallery}>
                                <div className={styles.mainImageWrapper}>
                                    <img 
                                        src={getFullImageUrl(activeImage)} 
                                        alt={product.name} 
                                        className={styles.mainImage} 
                                    />
                                </div>
                                <div className={styles.thumbnails}>
                                    {product.images?.slice(0, 4).map((img, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`${styles.thumb} ${activeImage === img.imageUrl ? styles.activeThumb : ''}`}
                                            onClick={() => setActiveImage(img.imageUrl)}
                                        >
                                            <img src={getFullImageUrl(img.imageUrl)} alt="thumbnail" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Product Info & Selectors */}
                            <div className={styles.details}>
                                <span className={styles.category}>{product.category?.name || 'Fashion'}</span>
                                <h2 className={styles.title}>{product.name}</h2>
                                
                                <div className={styles.priceRow}>
                                    {salePrice ? (
                                        <>
                                            <span className={styles.currentPrice}>${salePrice.toFixed(2)}</span>
                                            <span className={styles.originalPrice}>${price.toFixed(2)}</span>
                                            <span className={styles.discountBadge}>-{Math.round(((price - salePrice) / price) * 100)}%</span>
                                        </>
                                    ) : (
                                        <span className={styles.currentPrice}>${price.toFixed(2)}</span>
                                    )}
                                </div>

                                {/* Color Selection */}
                                <div className={styles.section}>
                                    <span className={styles.sectionTitle}>Color: <strong>{selectedColor}</strong></span>
                                    <div className={styles.options}>
                                        {availableColors.map((color, idx) => (
                                            <button 
                                                key={idx} 
                                                className={`${styles.optionBtn} ${selectedColor === color ? styles.selected : ''}`}
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    const sizesForColor = product.variants.filter(v => v.color === color).map(v => v.size);
                                                    if (!sizesForColor.includes(selectedSize)) {
                                                        setSelectedSize(sizesForColor[0]);
                                                    }
                                                }}
                                            >
                                                {color}
                                                {selectedColor === color && <BiCheck className={styles.checkIcon} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Size Selection */}
                                <div className={styles.section}>
                                    <span className={styles.sectionTitle}>Size: <strong>{selectedSize}</strong></span>
                                    <div className={styles.options}>
                                        {availableSizes.map((size, idx) => (
                                            <button 
                                                key={idx} 
                                                className={`${styles.optionBtn} ${selectedSize === size ? styles.selected : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity & Add To Cart */}
                                <div className={styles.actions}>
                                    <div className={styles.quantity}>
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><BiMinus /></button>
                                        <input 
                                            type="text" 
                                            value={quantity} 
                                            onChange={handleQuantityChange}
                                            onBlur={handleBlur}
                                            className={styles.qtyInput}
                                        />
                                        <button onClick={() => setQuantity(q => (q === '' ? 1 : Math.min(stockCount, q + 1)))}><BiPlus /></button>
                                    </div>
                                    <button 
                                        className={styles.addToCartBtn} 
                                        onClick={handleAddToCart}
                                        disabled={stockCount <= 0}
                                    >
                                        <BiCartAlt size={20} />
                                        {stockCount > 0 ? 'Add To Cart' : 'Out Of Stock'}
                                    </button>
                                </div>

                                <div className={styles.stockInfo}>
                                    {stockCount <= 0 ? (
                                        <span className={styles.outOfStock}>● Out of Stock</span>
                                    ) : stockCount < 10 ? (
                                        <span className={styles.inStock} style={{ color: '#f57c00' }}>● Only {stockCount} left</span>
                                    ) : (
                                        <span className={styles.inStock}>● {stockCount} in stock</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QuickViewModal;
