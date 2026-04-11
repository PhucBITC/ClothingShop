import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiCartAlt, BiShow, BiSync } from 'react-icons/bi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../common/toast/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import QuickViewModal from '../products/QuickViewModal';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { formatPrice } = useSettings();
    const toast = useToast();

    const isLiked = isInWishlist(product.id);

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const primary = product.images.find(img => img.primary);
            const imageUrl = primary ? primary.imageUrl : product.images[0].imageUrl;
            
            // Nếu là URL đầy đủ thì giữ nguyên
            if (imageUrl.startsWith('http')) return imageUrl;
            
            // Nếu chỉ là tên file, thêm prefix API files
            // Sử dụng URL tuyệt đối để tránh nhầm lẫn route
            return `http://localhost:8080/api/files/${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
        }
        return 'https://placehold.co/400x533?text=No+Image';
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        navigate(`/products/${product.slug}`);
    };

    const onToggleWishlist = (e) => {
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleQuickAddToCart = (e) => {
        e.stopPropagation();
        setIsQuickViewOpen(true);
    };

    return (
        <motion.div
            className={styles.productCard}
            onClick={handleViewDetails}
        >
            <div className={styles.imageWrapper}>
                {product.isNewArrival && <span className={styles.badge}>New</span>}

                <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className={styles.productImage}
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x533?text=Product+Image';
                    }}
                />

                {/* Side Actions (Visible on hover) */}
                <div className={styles.sideActions}>
                    <button
                        className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
                        onClick={onToggleWishlist}
                        aria-label="Toggle Wishlist"
                    >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                   
                    <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); setIsQuickViewOpen(true); }} aria-label="Quick View">
                        <BiShow />
                    </button>
                </div>

                {/* Bottom Action (Visible on hover) */}
                <div className={styles.bottomAction}>
                    <button className={styles.addToCartBtn} onClick={handleQuickAddToCart}>
                        Add to Cart
                    </button>
                </div>
            </div>

            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.category?.name || 'Fashion Item'}</p>
                <div className={styles.priceRow}>
                    <span className={styles.productPrice}>
                        {formatPrice(product.basePrice)}
                    </span>
                    {product.discountPrice && (
                        <span className={styles.discountPrice}>
                            {formatPrice(product.discountPrice)}
                        </span>
                    )}
                </div>
            </div>
            <QuickViewModal 
                product={product} 
                isOpen={isQuickViewOpen} 
                onClose={() => setIsQuickViewOpen(false)} 
            />
        </motion.div>
    );
};

export default ProductCard;
