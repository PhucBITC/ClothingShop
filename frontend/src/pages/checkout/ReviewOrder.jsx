import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiHome, BiCreditCard, BiListCheck, BiEdit, BiShoppingBag } from 'react-icons/bi';
import styles from './ReviewOrder.module.css';
import { products } from '../../data/mockData';

function ReviewOrder() {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);

    // Mock items based on image
    const orderItems = [
        { ...products[0], quantity: 1, size: 'S' }, // Girls Pink Moana
        { ...products[8], quantity: 1, size: 'Regular' }, // Handbag
        { ...products[11], quantity: 1, size: 'M' }, // Casual Shirt
    ];

    const subtotal = 200.00;
    const delivery = 5.00;
    const total = 205.00;

    const handlePlaceOrder = () => {
        setShowSuccess(true);
    };

    return (
        <div className={styles.checkoutContainer}>
            <h1 className={styles.pageTitle}>Review Your Order</h1>

            {/* Timeline */}
            <div className={styles.timeline}>
                <div className={`${styles.step} ${styles.active}`}>
                    <div className={styles.stepIcon}><BiHome /></div>
                    <span className={styles.stepLabel}>Address</span>
                </div>
                <div className={`${styles.step} ${styles.active}`}>
                    <div className={styles.stepIcon}><BiCreditCard /></div>
                    <span className={styles.stepLabel}>Payment Method</span>
                </div>
                <div className={`${styles.step} ${styles.active}`}>
                    <div className={styles.stepIcon}><BiListCheck /></div>
                    <span className={styles.stepLabel}>Review</span>
                </div>
            </div>

            <div className={styles.contentWrapper}>

                {/* Left Column: Order Details */}
                <div className={styles.leftColumn}>

                    <h3 className={styles.estimatedDelivery}>Estimated delivery: 22 Feb 2022</h3>

                    <div className={styles.orderItems}>
                        {orderItems.map((item, idx) => (
                            <div key={idx} className={styles.orderItem}>
                                <img src={item.image} alt={item.name} className={styles.productImg} />
                                <div className={styles.itemInfo}>
                                    <h4>{item.name}</h4>
                                    <div className={styles.itemPrice}>${item.price.toFixed(2)}</div>
                                    <div className={styles.itemSize}>Size: {item.size}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Shipping Address Review */}
                    <div className={styles.reviewSection}>
                        <h3 className={styles.sectionHeader}>Shipping Address</h3>
                        <div className={styles.sectionContent}>
                            <div>
                                <div className={styles.infoTitle}>Robert Fox</div>
                                <div className={styles.infoDetails}>4517 Washington Ave. Manchester, Kentucky 39495</div>
                            </div>
                            <div className={styles.editIcon}><BiEdit /></div>
                        </div>
                    </div>

                    {/* Payment Method Review */}
                    <div className={styles.reviewSection}>
                        <h3 className={styles.sectionHeader}>Payment Method</h3>
                        <div className={styles.sectionContent}>
                            <div>
                                <div className={styles.infoTitle}>Debit Card (.... .... .... ..89)</div>
                            </div>
                            <div className={styles.editIcon}><BiEdit /></div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Summary */}
                <div className={styles.summaryColumn}>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Subtotal</span>
                        <span style={{ fontWeight: '700' }}>${subtotal.toFixed(2)}</span>
                    </div>

                    <div className={styles.discountGroup}>
                        <input type="text" placeholder="Enter Discount Code" className={styles.discountInput} defaultValue="FLAT50" />
                        <button className={styles.applyBtn}>Apply</button>
                    </div>

                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Delivery Charge</span>
                        <span style={{ fontWeight: '700' }}>${delivery.toFixed(2)}</span>
                    </div>

                    <div className={styles.grandTotal}>
                        <span>Grand Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <button className={styles.placeOrderBtn} onClick={handlePlaceOrder}>Place Order</button>
                </div>

            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIcon}>
                            <BiShoppingBag />
                        </div>
                        <h2 className={styles.modalTitle}>Your order is confirmed</h2>
                        <p className={styles.modalText}>Thanks for shopping! your order hasn't shipped yet, but we will send you and email when it done.</p>

                        <button className={styles.viewOrderBtn} onClick={() => alert('View Order feature coming soon!')}>View Order</button>
                        <button className={styles.homeBtn} onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewOrder;
