import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiTrash, BiShoppingBag } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './Wishlist.module.css';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import ConfirmModal from '../../components/common/modal/ConfirmModal';
import { useToast } from '../../components/common/toast/ToastContext';

function Wishlist() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [modalConfig, setModalConfig] = useState({ isOpen: false, item: null });
    const toast = useToast();
    const navigate = useNavigate();

    const handleDeleteClick = (e, item) => {
        e.preventDefault();
        setModalConfig({ isOpen: true, item });
    };

    const handleConfirmDelete = () => {
        if (modalConfig.item) {
            removeFromWishlist(modalConfig.item.id);
            toast.success("Success", "Removed from wishlist successfully");
        }
        setModalConfig({ isOpen: false, item: null });
    };

    const handleViewDetails = (e, item) => {
        e.preventDefault();
        navigate(`/products/${item.id}`);
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Wishlist */}
                <div className={styles.mainContent}>

                    <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>My Wishlist ({wishlistItems.length})</h3>

                    {wishlistItems.length === 0 ? (
                        <div className={styles.emptyWishlist}>
                            <p>Your wishlist is currently empty.</p>
                            <Link to="/products" className={styles.shopNowBtn}>
                                <BiShoppingBag /> Shop Now
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.wishlistGrid}>
                            {wishlistItems.map((item) => (
                                <div key={item.id} className={styles.wishlistCard}>
                                    <div className={styles.imageWrapper}>
                                        <img
                                            src={item.image || (item.images && item.images[0]?.imageUrl)}
                                            alt={item.name}
                                            className={styles.productImg}
                                        />
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => handleDeleteClick(e, item)}
                                            aria-label="Remove from wishlist"
                                        >
                                            <BiTrash />
                                        </button>
                                    </div>

                                    <div className={styles.productInfo}>
                                        <div className={styles.productBrand}>{item.category?.name || 'Fashion'}</div>
                                        <h4>{item.name}</h4>
                                        <div className={styles.priceRow}>
                                            <span className={styles.price}>${item.basePrice?.toFixed(2)}</span>
                                            {item.discountPrice && (
                                                <span className={styles.oldPrice}>${item.discountPrice?.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className={styles.moveToCartBtn}
                                        onClick={(e) => handleViewDetails(e, item)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, item: null })}
                onConfirm={handleConfirmDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete"
                itemName={modalConfig.item?.name}
                confirmText="Delete"
                confirmColor="#dc2626"
            />
        </div>
    );
}

export default Wishlist;
