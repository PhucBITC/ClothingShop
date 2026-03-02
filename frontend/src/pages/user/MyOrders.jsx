import React, { useState, useEffect } from 'react';
import { BiSearch, BiSliderAlt } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './MyOrders.module.css';
import axios from '../../api/axios';
import { useToast } from '../../components/common/toast/ToastContext';
import ConfirmModal from '../../components/common/modal/ConfirmModal';
import OrderDetailsModal from './OrderDetailsModal';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, orderId: null });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, order: null });
    const toast = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/orders/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            await axios.put(`/orders/admin/${modalConfig.orderId}/status`, { status: "CANCELLED" });
            toast.success("Order cancelled successfully!");
            fetchOrders();
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("Failed to cancel order.");
        } finally {
            setModalConfig({ isOpen: false, orderId: null });
        }
    };

    const getStatusInfo = (status) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED':
                return { label: 'Delivered', class: styles.delivered, message: 'Your product has been delivered' };
            case 'PENDING':
                return { label: 'Pending', class: styles.inprocess, message: 'Your order is awaiting confirmation' };
            case 'CONFIRMED':
                return { label: 'Confirmed', class: styles.inprocess, message: 'Order has been confirmed' };
            case 'SHIPPED':
                return { label: 'Shipped', class: styles.inprocess, message: 'Your order is on the way' };
            case 'CANCELLED':
                return { label: 'Cancelled', class: styles.cancelled, message: 'This order has been cancelled' };
            default:
                return { label: status, class: styles.inprocess, message: `Status: ${status}` };
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchQuery) ||
            order.items.some(item => item.productVariant.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || order.status.toUpperCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewDetails = (order) => {
        setDetailsModal({ isOpen: true, order });
    };

    const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <div className={styles.sidebarContainer}>
                    <UserSidebar />
                </div>

                {/* Main Content: Orders */}
                <div className={styles.mainContent}>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <div className={styles.searchBox}>
                            <BiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by Order ID or Product"
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterWrapper}>
                            <button
                                className={`${styles.filterBtn} ${statusFilter !== 'ALL' ? styles.filterActive : ''}`}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                {statusFilter === 'ALL' ? 'Filter' : statusFilter} <BiSliderAlt />
                            </button>
                            {isFilterOpen && (
                                <div className={styles.filterDropdown}>
                                    {statuses.map(status => (
                                        <button
                                            key={status}
                                            className={`${styles.filterOption} ${statusFilter === status ? styles.activeOption : ''}`}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setIsFilterOpen(false);
                                            }}
                                        >
                                            {status.charAt(0) + status.slice(1).toLowerCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order List */}
                    {loading ? (
                        <div className={styles.loading}>Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className={styles.emptyState}>No orders found.</div>
                    ) : (
                        filteredOrders.map((order) => {
                            const firstItem = order.items[0];
                            const statusInfo = getStatusInfo(order.status);
                            return (
                                <div key={order.id} className={styles.orderCard}>

                                    <div className={styles.productSection}>
                                        <div className={styles.productImg}>
                                            {order.items?.[0]?.productVariant?.product?.images?.[0] ? (
                                                <img
                                                    src={order.items[0].productVariant.product.images[0].imageUrl.startsWith('http')
                                                        ? order.items[0].productVariant.product.images[0].imageUrl
                                                        : `http://localhost:8080/api/files/${order.items[0].productVariant.product.images[0].imageUrl}`}
                                                    alt={order.items[0].productVariant.product.name}
                                                />
                                            ) : (
                                                <div className={styles.placeholderImg}>No Image</div>
                                            )}
                                        </div>
                                        <div className={styles.productDetails}>
                                            <h4>{firstItem?.productVariant.product.name} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</h4>
                                            <div className={styles.productMeta}>Order ID: #{order.id}</div>
                                            <div className={styles.productMeta}>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                                            <div className={styles.price}>${order.totalPrice.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <div className={styles.statusSection}>
                                        <span className={`${styles.statusBadge} ${statusInfo.class}`}>
                                            {statusInfo.label}
                                        </span>
                                        <span className={styles.statusMessage}>{statusInfo.message}</span>
                                    </div>

                                    <div className={styles.actionSection}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            View Details
                                        </button>
                                        {order.status === 'DELIVERED' ? (
                                            <button className={`${styles.actionBtn} ${styles.primary}`}>Write A Review</button>
                                        ) : (
                                            order.status !== 'CANCELLED' && (
                                                <button
                                                    className={`${styles.actionBtn} ${styles.cancel}`}
                                                    onClick={() => setModalConfig({ isOpen: true, orderId: order.id })}
                                                >
                                                    Cancel Order
                                                </button>
                                            )
                                        )}
                                    </div>

                                </div>
                            );
                        })
                    )}

                </div>

                <ConfirmModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig({ isOpen: false, orderId: null })}
                    onConfirm={handleCancelOrder}
                    title="Cancel Order"
                    message="Are you sure you want to cancel order"
                    itemName={`#${modalConfig.orderId}`}
                    confirmText="Cancel Order"
                    confirmColor="#ff6b6b"
                />

                <OrderDetailsModal
                    isOpen={detailsModal.isOpen}
                    onClose={() => setDetailsModal({ isOpen: false, order: null })}
                    order={detailsModal.order}
                />
            </div>
        </div>
    );
}

export default MyOrders;
