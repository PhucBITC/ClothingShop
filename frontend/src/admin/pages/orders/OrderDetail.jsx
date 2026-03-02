import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BiArrowBack, BiPackage, BiUser, BiCreditCard, BiMap, BiTimeFive } from 'react-icons/bi';
import axios from '../../../api/axios';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './OrderDetail.module.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`/orders/admin/${id}`);
            setOrder(response.data);
        } catch (error) {
            toast.error("Error", "Failed to fetch order details.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await axios.put(`/orders/admin/${id}/status`, { status: newStatus });
            setOrder({ ...order, status: newStatus });
            toast.success("Success", `Order status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Error", "Failed to update order status.");
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const getProductImage = (product) => {
        if (product?.images && product.images.length > 0) {
            const primaryImg = product.images.find(img => img.isPrimary) || product.images[0];
            // The imageUrl in DB already contains the full URL (e.g., http://localhost:8080/api/files/products/uuid_name.jpg)
            return primaryImg.imageUrl;
        }
        return `https://via.placeholder.com/400x533?text=${encodeURIComponent(product?.name || 'Product')}`;
    };

    const getStatusColor = (status) => {
        if (!status) return styles.statusDefault;
        switch (status.toUpperCase()) {
            case 'PENDING': return styles.statusPending;
            case 'CONFIRMED': return styles.statusConfirmed;
            case 'SHIPPED': return styles.statusShipped;
            case 'DELIVERED': return styles.statusDelivered;
            case 'CANCELLED': return styles.statusCancelled;
            default: return styles.statusDefault;
        }
    };

    if (loading) return <div className={styles.loading}>Loading order details...</div>;
    if (!order) return <div className={styles.error}>Order not found.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/admin/orders')}>
                    <BiArrowBack /> Back to Orders
                </button>
                <div className={styles.headerInfo}>
                    <h2 className={styles.title}>Order Details {order.orderCode}</h2>
                    <span className={styles.date}>Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Column: Items and Summary */}
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <BiPackage />
                            <h3>Order Items</h3>
                        </div>
                        <div className={styles.itemsList}>
                            {order.items?.map((item) => (
                                <div key={item.id} className={styles.itemRow}>
                                    <div className={styles.itemMain}>
                                        <div className={styles.itemImage}>
                                            <img src={getProductImage(item.productVariant?.product)} alt={item.productVariant?.product?.name} />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <h4 className={styles.itemName}>{item.productVariant?.product?.name || 'Unknown Product'}</h4>
                                            <p className={styles.itemVariant}>Size: {item.productVariant?.size || 'N/A'} | Color: {item.productVariant?.color || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        <span className={styles.pricePer}>${(item.price || 0).toFixed(2)} x {item.quantity}</span>
                                        <span className={styles.totalPer}>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.orderSummary}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>${(order.items?.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0) || 0).toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Delivery Fee</span>
                                <span>${(order.totalPrice - (order.items?.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0) || 0)).toFixed(2)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                                <span>Total Price</span>
                                <span>${(order.totalPrice || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer info and Status */}
                <div className={styles.rightColumn}>
                    {/* Status Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <BiTimeFive />
                            <h3>Order Status</h3>
                        </div>
                        <div className={styles.statusBox}>
                            <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                            <div className={styles.statusUpdate}>
                                <label>Change Status</label>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updating}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                {updating && <small>Updating...</small>}
                            </div>
                        </div>
                    </div>

                    {/* Customer Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <BiUser />
                            <h3>Customer</h3>
                        </div>
                        <div className={styles.customerBox}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Name</span>
                                <span className={styles.value}>{order.receiverName || 'Unknown'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Phone</span>
                                <span className={styles.value}>{order.receiverPhone || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Email</span>
                                <span className={styles.value}>{order.user?.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <BiMap />
                            <h3>Shipping Address</h3>
                        </div>
                        <div className={styles.addressBox}>
                            <p>{order.shippingAddress}</p>
                        </div>
                    </div>

                    {/* Payment Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <BiCreditCard />
                            <h3>Payment Info</h3>
                        </div>
                        <div className={styles.paymentBox}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Method</span>
                                <span className={styles.value}>{order.payment?.paymentMethod || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Status</span>
                                <span className={`${styles.paymentStatus} ${order.payment?.paymentStatus === 'PAID' ? styles.paid : styles.unpaid}`}>
                                    {order.payment?.paymentStatus || 'UNKNOWN'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
