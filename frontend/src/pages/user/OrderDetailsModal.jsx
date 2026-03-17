import React from 'react';
import { BiX, BiPackage, BiCreditCard, BiMapPin } from 'react-icons/bi';
import styles from './OrderDetailsModal.module.css';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div>
                        <h2 className={styles.modalTitle}>Order Details</h2>
                        <span className={styles.orderId}>Order Code: {order.orderCode}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><BiX /></button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <div className={styles.cardHeader}>
                                <BiMapPin className={styles.cardIcon} />
                                <h3>Shipping Address</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <p className={styles.receiverName}>{order.receiverName}</p>
                                <p>{order.receiverPhone}</p>
                                <p>{order.shippingAddress}</p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.cardHeader}>
                                <BiCreditCard className={styles.cardIcon} />
                                <h3>Payment Info</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <p>Method: {order.payment?.paymentMethod || 'N/A'}</p>
                                <p>Status: <span className={styles.paymentStatus}>{order.payment?.paymentStatus || 'PENDING'}</span></p>
                                <p>Date: {formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.itemsSection}>
                        <div className={styles.sectionHeader}>
                            <BiPackage className={styles.cardIcon} />
                            <h3>Order Items</h3>
                        </div>
                        <div className={styles.itemsList}>
                            {order.items.map((item, idx) => (
                                <div key={idx} className={styles.orderItem}>
                                    <img
                                        src={item.productVariant.product.images?.[0]
                                            ? (item.productVariant.product.images[0].imageUrl.startsWith('http')
                                                ? item.productVariant.product.images[0].imageUrl
                                                : `http://localhost:8080/api/files/${item.productVariant.product.images[0].imageUrl}`)
                                            : ''}
                                        alt={item.productVariant.product.name}
                                        className={styles.itemImg}
                                    />
                                    <div className={styles.itemInfo}>
                                        <h4>{item.productVariant.product.name}</h4>
                                        <div className={styles.itemMeta}>
                                            <span>Size: {item.productVariant.size}</span>
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.summarySection}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>${(order.subtotal || order.totalPrice).toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>{order.deliveryCharge > 0 ? `$${order.deliveryCharge.toFixed(2)}` : 'Free'}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                <span>Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                                <span className={styles.discountValue}>-${order.discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                            <span>Total</span>
                            <span>${order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <div className={`${styles.statusBadge} ${styles[order.status.toLowerCase()] || ''}`}>
                        Current Status: {order.status}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
