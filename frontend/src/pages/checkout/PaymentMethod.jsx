import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiHome, BiCreditCard, BiListCheck, BiPurchaseTag, BiX, BiCheckCircle } from 'react-icons/bi';
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
    
    // Fix: Memoize baseTotals to avoid infinite loop in useEffect
    const baseTotals = useMemo(() => calculateTotals(checkoutItems), [calculateTotals, checkoutItems]);

    const [selectedMethod, setSelectedMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    
    // Discount State
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [availableVouchers, setAvailableVouchers] = useState([]);
    
    // Final Totals
    const [finalTotals, setFinalTotals] = useState(baseTotals);

    useEffect(() => {
        if (!addressId || checkoutItems.length === 0) {
            navigate('/checkout');
        }
    }, [addressId, checkoutItems, navigate]);

    useEffect(() => {
        let currentSubtotal = baseTotals.subtotal;
        let discountAmt = 0;

        if (appliedDiscount) {
            if (appliedDiscount.type === 'PERCENTAGE') {
                discountAmt = (currentSubtotal * appliedDiscount.value) / 100;
                if (appliedDiscount.maxDiscountAmount && discountAmt > appliedDiscount.maxDiscountAmount) {
                    discountAmt = appliedDiscount.maxDiscountAmount;
                }
            } else {
                discountAmt = appliedDiscount.value;
            }
        }

        const newTotal = Math.max(0, currentSubtotal - discountAmt + baseTotals.deliveryCharge);
        setFinalTotals({
            ...baseTotals,
            discount: discountAmt,
            total: newTotal
        });
    }, [appliedDiscount, baseTotals]);

    const handleApplyDiscount = async (codeToTry = discountCode) => {
        if (!codeToTry) return;
        setValidating(true);
        try {
            const response = await axios.get('/discounts/validate', {
                params: {
                    code: codeToTry,
                    amount: baseTotals.subtotal
                }
            });
            setAppliedDiscount(response.data);
            setDiscountCode('');
            setShowVoucherModal(false);
            toast.success('Discount Applied', `You saved $${calculateDiscountAmount(response.data).toFixed(2)}`);
        } catch (error) {
            toast.error('Invalid Code', error.response?.data?.message || 'Failed to apply discount');
        } finally {
            setValidating(false);
        }
    };

    const calculateDiscountAmount = (discount) => {
        if (!discount) return 0;
        let amt = 0;
        if (discount.type === 'PERCENTAGE') {
            amt = (baseTotals.subtotal * discount.value) / 100;
            if (discount.maxDiscountAmount && amt > discount.maxDiscountAmount) {
                amt = discount.maxDiscountAmount;
            }
        } else {
            amt = discount.value;
        }
        return amt;
    };

    const fetchVouchers = async () => {
        try {
            const response = await axios.get('/discounts');
            // Show all active vouchers, even if expired or limit reached (so user knows why they can't use them)
            const filtered = response.data.filter(v => v.isActive);
            setAvailableVouchers(filtered);
            setShowVoucherModal(true);
        } catch (error) {
            toast.error('Error', 'Failed to fetch vouchers');
        }
    };

    const getVoucherStatus = (v) => {
        const now = new Date();
        const start = v.startDate ? new Date(v.startDate) : null;
        const end = v.endDate ? new Date(v.endDate) : null;

        if (start && now < start) return { disabled: true, reason: 'Coming Soon', label: 'UPCOMING' };
        if (end && now > end) return { disabled: true, reason: 'This voucher has expired', label: 'EXPIRED' };
        if (v.usageLimit && v.usageCount >= v.usageLimit) return { disabled: true, reason: 'Usage limit reached', label: 'FULL' };
        if (v.minOrderAmount > baseTotals.subtotal) return { disabled: true, reason: `Min order of $${v.minOrderAmount} required`, label: 'INELIGIBLE' };
        
        return { disabled: false, reason: null, label: null };
    };

    const handleContinue = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/orders/checkout', {
                addressId: addressId,
                paymentMethod: selectedMethod,
                discountCode: appliedDiscount?.code
            });

            if (response.data.paymentUrl) {
                sessionStorage.setItem('checkoutState', JSON.stringify({
                    addressId: addressId,
                    items: checkoutItems
                }));
                window.location.href = response.data.paymentUrl;
            } else {
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

                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('COD')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'COD' ? styles.selected : ''} `}>
                                    {selectedMethod === 'COD' && <div className={styles.innerCircle} />}
                                </div>
                                <span>Cash on Delivery (COD)</span>
                            </div>
                        </div>

                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('VNPAY')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'VNPAY' ? styles.selected : ''} `}>
                                    {selectedMethod === 'VNPAY' && <div className={styles.innerCircle} />}
                                </div>
                                <span>VNPay (ATM / QR Code)</span>
                            </div>
                        </div>

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
                        {loading ? (
                            <div className={styles.loadingWrapper}>
                                <svg className={styles.spinner} viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="11" y="1" width="2" height="5" opacity="1" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity="0.9" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity="0.8" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity="0.7" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity="0.6" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity="0.5" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)" opacity="0.4" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(210 12 12)" opacity="0.3" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(240 12 12)" opacity="0.2" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(270 12 12)" opacity="0.1" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(300 12 12)" opacity="0.05" />
                                    <rect x="11" y="1" width="2" height="5" transform="rotate(330 12 12)" opacity="0.02" />
                                </svg>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            'Continue'
                        )}
                    </button>

                </div>

                {/* Right Column: Summary */}
                <div className={styles.summaryColumn}>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Subtotal</span>
                        <span style={{ fontWeight: '700' }}>${finalTotals.subtotal.toFixed(2)}</span>
                    </div>

                    <div className={styles.discountWrapper}>
                        <div className={styles.discountLabelRow}>
                            <label className={styles.discountLabel}>Discount Code</label>
                            <span className={styles.browseVouchers} onClick={fetchVouchers}>Browse Vouchers</span>
                        </div>
                        
                        {!appliedDiscount ? (
                            <div className={styles.discountGroup}>
                                <input 
                                    type="text" 
                                    placeholder="Enter code" 
                                    className={styles.discountInput} 
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                />
                                <button 
                                    className={styles.applyBtn} 
                                    onClick={() => handleApplyDiscount(discountCode.trim())}
                                    disabled={validating || !discountCode.trim()}
                                >
                                    {validating ? '...' : 'Apply'}
                                </button>
                            </div>
                        ) : (
                            <div className={styles.appliedDiscountInfo}>
                                <div className={styles.appliedText}>
                                    <BiCheckCircle style={{ marginRight: '6px' }} />
                                    {appliedDiscount.code} Applied
                                </div>
                                <button className={styles.removeDiscount} onClick={() => setAppliedDiscount(null)}>
                                    <BiX />
                                </button>
                            </div>
                        )}
                    </div>

                    {finalTotals.discount > 0 && (
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Discount Saved</span>
                            <span style={{ fontWeight: '700', color: '#10b981' }}>-${finalTotals.discount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Delivery Charge</span>
                        <span style={{ fontWeight: '700' }}>${finalTotals.deliveryCharge.toFixed(2)}</span>
                    </div>
                    
                    <div className={styles.grandTotal}>
                        <span>Grand Total</span>
                        <span>${finalTotals.total.toFixed(2)}</span>
                    </div>
                </div>

            </div>

            {/* Voucher Picker Modal */}
            {showVoucherModal && (
                <div className={styles.modalOverlay} onClick={() => setShowVoucherModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Available Vouchers</h2>
                            <button className={styles.closeModal} onClick={() => setShowVoucherModal(false)}><BiX /></button>
                        </div>
                        
                        <div className={styles.voucherList}>
                            {availableVouchers.length > 0 ? (
                                availableVouchers.map(v => {
                                    const status = getVoucherStatus(v);
                                    return (
                                        <div 
                                            key={v.id} 
                                            className={`${styles.voucherCard} ${status.disabled ? styles.disabledVoucher : ''}`}
                                            onClick={() => {
                                                if (!status.disabled) {
                                                    handleApplyDiscount(v.code);
                                                }
                                            }}
                                        >
                                            <div className={styles.voucherIcon}>
                                                <BiPurchaseTag />
                                            </div>
                                            <div className={styles.voucherInfo}>
                                                <div className={styles.voucherHeaderRow}>
                                                    <div className={styles.voucherCodeName}>{v.code}</div>
                                                    {status.label && <span className={`${styles.statusLabel} ${styles[status.label.toLowerCase().replace(' ', '')]}`}>{status.label}</span>}
                                                </div>
                                                <div className={styles.voucherDesc}>{v.description}</div>
                                                {status.reason && (
                                                    <div className={styles.voucherLimits}>{status.reason}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={styles.emptyVouchers}>No active vouchers found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentMethod;
