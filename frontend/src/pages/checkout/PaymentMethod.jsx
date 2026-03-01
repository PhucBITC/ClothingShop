import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiHome, BiCreditCard, BiListCheck } from 'react-icons/bi';
import { useCart } from '../../context/CartContext';
import axios from '../../api/axios';
import { useToast } from '../../components/common/toast/ToastContext';
import styles from './PaymentMethod.module.css';

function PaymentMethod() {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { calculateTotals, clearCart } = useCart();

    const addressId = location.state?.addressId;
    const checkoutItems = location.state?.items || [];
    const { subtotal, deliveryCharge, total } = calculateTotals(checkoutItems);
    const [selectedMethod, setSelectedMethod] = useState('COD');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!addressId || checkoutItems.length === 0) {
            navigate('/checkout');
        }
    }, [addressId, checkoutItems, navigate]);

    const handleContinue = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/orders/checkout', {
                addressId: addressId,
                paymentMethod: selectedMethod
            });

            if (response.data.paymentUrl) {
                // Redirect to VNPay or PayPal
                window.location.href = response.data.paymentUrl;
            } else {
                // COD or other local process
                toast.success("Success", "Order placed successfully!");
                clearCart();
                navigate('/checkout/review', { state: { order: response.data } });
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Error", error.response?.data || "Failed to place order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.checkoutContainer}>
            <h1 className={styles.pageTitle}>Payment Method</h1>

            {/* Timeline */}
            <div className={styles.timeline}>
                <div className={`${styles.step} ${styles.active} `}>
                    <div className={styles.stepIcon}><BiHome /></div>
                    <span className={styles.stepLabel}>Address</span>
                </div>
                <div className={`${styles.step} ${styles.active} `}>
                    <div className={styles.stepIcon}><BiCreditCard /></div>
                    <span className={styles.stepLabel}>Payment Method</span>
                </div>
                <div className={styles.step}>
                    <div className={styles.stepIcon}><BiListCheck /></div>
                    <span className={styles.stepLabel}>Review</span>
                </div>
            </div>

            <div className={styles.contentWrapper}>

                {/* Left Column: Payment Options */}
                <div className={styles.leftColumn}>
                    <h3 className={styles.sectionHeader}>Select a payment method</h3>

                    <div className={styles.paymentOptions}>

                        {/* Cash on Delivery */}
                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('COD')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'COD' ? styles.selected : ''} `}>
                                    {selectedMethod === 'COD' && <div className={styles.innerCircle} />}
                                </div>
                                <span>Cash on Delivery (COD)</span>
                            </div>
                        </div>

                        {/* VNPay */}
                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('VNPAY')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'VNPAY' ? styles.selected : ''} `}>
                                    {selectedMethod === 'VNPAY' && <div className={styles.innerCircle} />}
                                </div>
                                <span>VNPay (ATM / QR Code)</span>
                            </div>
                        </div>

                        {/* Paypal */}
                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('PAYPAL')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'PAYPAL' ? styles.selected : ''} `}>
                                    {selectedMethod === 'PAYPAL' && <div className={styles.innerCircle} />}
                                </div>
                                <span>Paypal</span>
                            </div>
                        </div>

                    </div>

                    <button
                        className={styles.continueBtn}
                        onClick={handleContinue}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Continue'}
                    </button>

                </div>

                {/* Right Column: Summary */}
                <div className={styles.summaryColumn}>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Subtotal</span>
                        <span style={{ fontWeight: '700' }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.discountWrapper}>
                        <label className={styles.discountLabel}>Enter Discount Code</label>
                        <div className={styles.discountGroup}>
                            <input type="text" placeholder="FLAT50" className={styles.discountInput} />
                            <button className={styles.applyBtn}>Apply</button>
                        </div>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Delivery Charge</span>
                        <span style={{ fontWeight: '700' }}>${deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className={styles.grandTotal}>
                        <span>Grand Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PaymentMethod;
