import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiCartAlt, BiShow, BiSync } from 'react-icons/bi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../../context/WishlistContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const isLiked = isInWishlist(product.id);

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const primary = product.images.find(img => img.primary);
            return primary ? primary.imageUrl : product.images[0].imageUrl;
        }
        return 'https://via.placeholder.com/400x533?text=No+Image';
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        navigate(`/products/${product.id}`);
    };

    const onToggleWishlist = (e) => {
        e.stopPropagation();
        toggleWishlist(product);
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
                        e.target.src = 'https://via.placeholder.com/400x533?text=Product+Image';
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
                    <button className={styles.actionBtn} aria-label="Compare">
                        <BiSync />
                    </button>
                    <button className={styles.actionBtn} onClick={handleViewDetails} aria-label="Quick View">
                        <BiShow />
                    </button>
                </div>

                {/* Bottom Action (Visible on hover) */}
                <div className={styles.bottomAction}>
                    <button className={styles.addToCartBtn}>Add to Cart</button>
                </div>
            </div>

            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.category?.name || 'Fashion Item'}</p>
                <div className={styles.priceRow}>
                    <span className={styles.productPrice}>
                        ${product.basePrice?.toFixed(2)}
                    </span>
                    {product.discountPrice && (
                        <span className={styles.discountPrice}>
                            ${product.discountPrice?.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
