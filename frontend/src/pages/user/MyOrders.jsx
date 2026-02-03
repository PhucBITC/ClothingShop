import React from 'react';
import { BiSearch, BiSliderAlt } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './MyOrders.module.css';
import { products } from '../../data/mockData';

function MyOrders() {
    // Mock Orders Logic
    const orders = [
        {
            id: 'ORD-001',
            product: products[0], // Girls Pink Moana
            price: 80.00,
            size: 'S',
            qty: 1,
            status: 'Delivered',
            message: 'Your product has been delivered'
        },
        {
            id: 'ORD-002',
            product: products[8], // Handbag
            price: 80.00,
            size: 'Regular',
            qty: 1,
            status: 'In Process',
            message: 'Your product has been Inprocess'
        },
        {
            id: 'ORD-003',
            product: products[11], // Casual Shirt
            price: 40.00,
            size: 'M',
            qty: 1,
            status: 'In Process',
            message: 'Your product has been Inprocess'
        }
    ];

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Orders */}
                <div className={styles.mainContent}>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <div className={styles.searchBox}>
                            <BiSearch className={styles.searchIcon} />
                            <input type="text" placeholder="Search" className={styles.searchInput} />
                        </div>
                        <button className={styles.filterBtn}>
                            Filter <BiSliderAlt />
                        </button>
                    </div>

                    {/* Order List */}
                    {orders.map((order, idx) => (
                        <div key={idx} className={styles.orderCard}>

                            <div className={styles.productSection}>
                                <img src={order.product.image} alt={order.product.name} className={styles.productImg} />
                                <div className={styles.productDetails}>
                                    <h4>{order.product.name}</h4>
                                    <div className={styles.productMeta}>Size: {order.size}</div>
                                    <div className={styles.productMeta}>Qyt: {order.qty}</div>
                                    <div className={styles.price}>${order.price.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className={styles.statusSection}>
                                <span className={`${styles.statusBadge} ${order.status === 'Delivered' ? styles.delivered : styles.inprocess}`}>
                                    {order.status}
                                </span>
                                <span className={styles.statusMessage}>{order.message}</span>
                            </div>

                            <div className={styles.actionSection}>
                                <button className={styles.actionBtn}>View Order</button>
                                {order.status === 'Delivered' ? (
                                    <button className={`${styles.actionBtn} ${styles.primary}`}>Write A Review</button>
                                ) : (
                                    <button className={`${styles.actionBtn} ${styles.cancel}`}>Cancel Order</button>
                                )}
                            </div>

                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}

export default MyOrders;
