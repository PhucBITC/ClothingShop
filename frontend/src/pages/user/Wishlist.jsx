import React from 'react';
import { Link } from 'react-router-dom';
import { BiTrash } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './Wishlist.module.css';
import { useWishlist } from '../../context/WishlistContext';

function Wishlist() {
    const { wishlistItems, removeFromWishlist } = useWishlist();

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
                            <Link to="/products" className={styles.shopNowBtn}>Shop Now</Link>
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
                                            onClick={() => removeFromWishlist(item.id)}
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

                                    <button className={styles.moveToCartBtn}>Move to Cart</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Wishlist;
