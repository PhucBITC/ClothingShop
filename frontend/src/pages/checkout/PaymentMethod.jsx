import React, { useState } from 'react';
import { BiHome, BiCreditCard, BiListCheck } from 'react-icons/bi';
import styles from './PaymentMethod.module.css';

function PaymentMethod() {
    const [selectedMethod, setSelectedMethod] = useState('card');

    // Mock calculations
    const subtotal = 200.00;
    const delivery = 5.00;
    const total = 205.00;

    return (
        <div className={styles.checkoutContainer}>
            <h1 className={styles.pageTitle}>Payment Method</h1>

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

                        {/* Debit/Credit Card */}
                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('card')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'card' ? styles.selected : ''}`}>
                                    {selectedMethod === 'card' && <div className={styles.innerCircle} />}
                                </div>
                                <span>Debit/Credit Card</span>
                            </div>

                            {selectedMethod === 'card' && (
                                <div className={styles.cardForm}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Card Number</label>
                                        <input type="text" className={styles.input} placeholder="3897 22XX 1900 3890" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Card Name</label>
                                        <input type="text" className={styles.input} placeholder="Robert Fox" />
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Expiry Date</label>
                                            <input type="text" className={styles.input} placeholder="09/26" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>CVV</label>
                                            <input type="text" className={styles.input} placeholder="..." />
                                        </div>
                                    </div>
                                    <button className={styles.addCardBtn}>Add Card</button>
                                </div>
                            )}
                        </div>

                        {/* Google Pay */}
                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('googlepay')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'googlepay' ? styles.selected : ''}`}>
                                    {selectedMethod === 'googlepay' && <div className={styles.innerCircle} />}
                                </div>
                                <span>Google Pay</span>
                            </div>
                        </div>

                        {/* Paypal */}
                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('paypal')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'paypal' ? styles.selected : ''}`}>
                                    {selectedMethod === 'paypal' && <div className={styles.innerCircle} />}
                                </div>
                                <span>Paypal</span>
                            </div>
                        </div>

                        {/* Cash on Delivery */}
                        <div className={styles.paymentOption}>
                            <div className={styles.optionHeader} onClick={() => setSelectedMethod('cod')}>
                                <div className={`${styles.radioCircle} ${selectedMethod === 'cod' ? styles.selected : ''}`}>
                                    {selectedMethod === 'cod' && <div className={styles.innerCircle} />}
                                </div>
                                <span>Cash on Delivery</span>
                            </div>
                        </div>

                    </div>

                    <button className={styles.continueBtn}>Continue</button>

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
                </div>

            </div>
        </div>
    );
}

export default PaymentMethod;
