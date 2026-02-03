import React from 'react';
import { BiTrash } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './Wishlist.module.css';
import { products } from '../../data/mockData';

function Wishlist() {
    // Mock Wishlist Items (using some products from mockData)
    const wishlistItems = [
        products[8], // Handbag
        products[4], // T-shirt
        products[10], // Shoes
        products[5], // Jacket
        products[9], // Shoes
        products[1], // Handbag 2
        products[11], // Fixed from 12 (Index 12 is out of bounds)
        products[6], // Blazer
        products[3]  // Handbag 3
    ].filter(item => item); // Safety filter

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Wishlist */}
                <div className={styles.mainContent}>

                    <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>My Wishlist ({wishlistItems.length})</h3>

                    <div className={styles.wishlistGrid}>
                        {wishlistItems.map((item, idx) => (
                            <div key={idx} className={styles.wishlistCard}>
                                <div className={styles.imageWrapper}>
                                    <img src={item.image} alt={item.name} className={styles.productImg} />
                                    <button className={styles.deleteBtn} aria-label="Remove from wishlist">
                                        <BiTrash />
                                    </button>
                                </div>

                                <div className={styles.productInfo}>
                                    <div className={styles.productBrand}>Brand Name</div> {/* Mock brand */}
                                    <h4>{item.name}</h4>
                                    <div className={styles.priceRow}>
                                        <span className={styles.price}>${item.price.toFixed(2)}</span>
                                        <span className={styles.oldPrice}>${(item.price * 1.2).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button className={styles.moveToCartBtn}>Move to Cart</button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Wishlist;
