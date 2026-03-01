import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { BiHome, BiCreditCard, BiListCheck, BiEdit, BiShoppingBag, BiCheckCircle, BiLoaderAlt } from 'react-icons/bi';
import { useCart } from '../../context/CartContext';
import axios from '../../api/axios';
import styles from './ReviewOrder.module.css';

function ReviewOrder() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const [showSuccess, setShowSuccess] = useState(false);
    const [isPaymentComplete, setIsPaymentComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);

    const { cartItems, subtotal, deliveryCharge, total, clearCart } = useCart();

    // Fetch order details if we have an ID (from redirect or state)
    const fetchOrderDetails = useCallback(async (orderId) => {
        setLoading(true);
        try {
            // Using axios instance (already has /api base)
            const response = await axios.get(`/orders/${orderId}`);
            setOrderData(response.data);
            setIsPaymentComplete(true);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const vnpResponse = searchParams.get('vnp_ResponseCode');
        const paypalToken = searchParams.get('token');
        const urlOrderId = searchParams.get('orderId');
        const stateOrder = location.state?.order;

        if (vnpResponse === '00' || paypalToken || stateOrder) {
            setShowSuccess(true);
            setIsPaymentComplete(true);

            const orderId = urlOrderId || stateOrder?.id;
            if (orderId) {
                fetchOrderDetails(orderId);
            }

            // Online payments/COD might have cleared cart already, but ensure it's done
            if (cartItems.length > 0) clearCart();

            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, location.state, clearCart, cartItems.length, fetchOrderDetails]);

    const handlePlaceOrder = () => {
        setShowSuccess(true);
        setIsPaymentComplete(true);
        clearCart();
        setTimeout(() => setShowSuccess(false), 3000);
    };

    // Determine what to display (Live cart OR Fetched Order)
    const displayItems = orderData ? orderData.items.map(item => ({
        ...item,
        name: item.productVariant.product.name,
        image: item.productVariant.product.images?.[0]?.imageUrl || '/placeholder.png',
        size: item.productVariant.size,
        price: item.price
    })) : cartItems;

    const displaySubtotal = orderData ? (orderData.totalPrice - (orderData.totalPrice >= 30 ? 0 : 1.50)) : subtotal;
    const displayDelivery = orderData ? (orderData.totalPrice >= 30 ? 0 : 1.50) : deliveryCharge;
    const displayTotal = orderData ? orderData.totalPrice : total;

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <BiLoaderAlt className={styles.spinner} />
                <p>Loading order details...</p>
            </div>
        );
    }

    return (
        <div className={styles.checkoutContainer}>
            <div className={styles.containerInner}>
                <h1 className={styles.pageTitle}>Review Your Order</h1>

                {/* Timeline - Original Black Colors */}
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
                        <h3 className={styles.estimatedDelivery}>
                            {isPaymentComplete ? 'Order Confirmed!' : 'Estimated delivery: Feb 2026'}
                        </h3>

                        <div className={styles.orderItems}>
                            {displayItems.length > 0 ? (
                                displayItems.map((item, idx) => (
                                    <div key={idx} className={styles.orderItem}>
                                        <img
                                            src={item.image.startsWith('http') ? item.image : `http://localhost:8080/api/files/${item.image}`}
                                            alt={item.name}
                                            className={styles.productImg}
                                        />
                                        <div className={styles.itemInfo}>
                                            <h4>{item.name}</h4>
                                            <div className={styles.itemPrice}>${item.price.toFixed(2)}</div>
                                            <div className={styles.itemSize}>Size: {item.size}</div>
                                            <div className={styles.itemQty}>Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyItems}>
                                    {isPaymentComplete ? 'Your order has been placed successfully.' : 'No items to review.'}
                                </div>
                            )}
                        </div>

                        {/* Shipping Address Review */}
                        <div className={styles.reviewSection}>
                            <h3 className={styles.sectionHeader}>Shipping Address</h3>
                            <div className={styles.sectionContent}>
                                <div>
                                    <div className={styles.infoTitle}>
                                        {orderData ? orderData.receiverName : 'Default Address'}
                                    </div>
                                    <div className={styles.infoDetails}>
                                        {orderData ? orderData.shippingAddress : 'The address provided during checkout'}
                                    </div>
                                    {orderData && <div className={styles.infoPhone}>Phone: {orderData.receiverPhone}</div>}
                                </div>
                                {!isPaymentComplete && <div className={styles.editIcon}><BiEdit /></div>}
                            </div>
                        </div>

                        {/* Payment Method Review */}
                        {orderData && (
                            <div className={styles.reviewSection}>
                                <h3 className={styles.sectionHeader}>Payment Method</h3>
                                <div className={styles.sectionContent}>
                                    <div>
                                        <div className={styles.infoTitle}>
                                            {orderData.payment?.paymentMethod || 'Selected Method'}
                                        </div>
                                        <div className={styles.infoDetails}>
                                            Status: {orderData.payment?.paymentStatus}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Summary */}
                    <div className={styles.summaryColumn}>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Subtotal</span>
                            <span style={{ fontWeight: '700' }}>${displaySubtotal.toFixed(2)}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Delivery Charge</span>
                            <span style={{ fontWeight: '700' }}>${displayDelivery.toFixed(2)}</span>
                        </div>

                        <div className={styles.grandTotal}>
                            <span>Grand Total</span>
                            <span>${displayTotal.toFixed(2)}</span>
                        </div>

                        {!isPaymentComplete && (
                            <button className={styles.placeOrderBtn} onClick={handlePlaceOrder}>
                                Confirm and Place Order
                            </button>
                        )}

                        {isPaymentComplete && (
                            <button className={styles.viewOrdersBtn} onClick={() => navigate('/user/orders')}>
                                View My Orders
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Overlay */}
            {showSuccess && (
                <div className={styles.successOverlay}>
                    <div className={styles.vibrantCard}>
                        <div className={styles.animatedIconWrapper}>
                            <BiCheckCircle className={styles.successCheckIcon} />
                        </div>
                        <h2 className={styles.vibrantTitle}>Payment Successful!</h2>
                        <p className={styles.vibrantMessage}>Your payment has been successfully processed. Thank you for your purchase!</p>
                        <div className={styles.progressBarWrapper}>
                            <div className={styles.progressBar}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewOrder;
