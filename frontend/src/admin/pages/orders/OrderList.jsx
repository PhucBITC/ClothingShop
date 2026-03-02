import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiSearch, BiFilterAlt, BiShow, BiDotsVerticalRounded, BiTrash, BiXCircle } from 'react-icons/bi';
import axios from '../../../api/axios';
import { useToast } from '../../../components/common/toast/ToastContext';
import ConfirmModal from '../../../components/common/modal/ConfirmModal';
import styles from './OrderList.module.css';

const OrderList = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeMenu, setActiveMenu] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('delete'); // 'delete' or 'cancel'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
        const handleClickOutside = () => setActiveMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleBulkDelete = async () => {
        try {
            await axios.delete('/orders/admin/bulk', { data: selectedIds });
            toast.success("Success", "Selected orders deleted successfully.");
            setOrders(orders.filter(o => !selectedIds.includes(o.id)));
            setSelectedIds([]);
        } catch (error) {
            toast.error("Error", "Failed to delete selected orders.");
            console.error(error);
        } finally {
            setIsBulkModalOpen(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredOrders.map(o => o.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOrder = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/orders/admin/all');
            setOrders(response.data);
        } catch (error) {
            toast.error("Error", "Failed to fetch orders.");
            console.error("Order fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!selectedOrder) return;

        try {
            await axios.delete(`/orders/admin/${selectedOrder.id}`);
            toast.success("Success", "Order deleted successfully.");
            setOrders(orders.filter(o => o.id !== selectedOrder.id));
        } catch (error) {
            toast.error("Error", "Failed to delete order.");
            console.error(error);
        } finally {
            setIsModalOpen(false);
            setSelectedOrder(null);
        }
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            await axios.put(`/orders/admin/${selectedOrder.id}/status`, { status: 'CANCELLED' });
            toast.success("Success", "Order cancelled successfully.");
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o));
        } catch (error) {
            toast.error("Error", "Failed to cancel order.");
            console.error(error);
        } finally {
            setIsModalOpen(false);
            setSelectedOrder(null);
        }
    };

    const openConfirmModal = (order, type) => {
        setSelectedOrder(order);
        setModalType(type);
        setIsModalOpen(true);
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

    const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
        const matchesSearch =
            (order.id?.toString() || '').includes(searchTerm) ||
            (order.receiverName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        // Case-insensitive status matching for robustness
        const currentStatus = (order.status || '').toUpperCase();
        const filterStatus = statusFilter.toUpperCase();
        const matchesStatus = filterStatus === 'ALL' || currentStatus === filterStatus;

        return matchesSearch && matchesStatus;
    }) : [];

    if (loading) return <div className={styles.loading}>Loading orders...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2 className={styles.title}>All Orders</h2>
                    <span className={styles.count}>{filteredOrders.length} orders found</span>
                </div>
                <div className={styles.actions}>
                    <div className={styles.searchBox}>
                        <BiSearch />
                        <input
                            type="text"
                            placeholder="Search Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterBox}>
                        <BiFilterAlt />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            className={styles.bulkDeleteBtn}
                            onClick={() => setIsBulkModalOpen(true)}
                        >
                            <BiTrash /> Delete ({selectedIds.length})
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.checkboxCol}>
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
                                />
                            </th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className={selectedIds.includes(order.id) ? styles.selectedRow : ''}>
                                    <td className={styles.checkboxCol}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(order.id)}
                                            onChange={() => handleSelectOrder(order.id)}
                                        />
                                    </td>
                                    <td className={styles.orderId}>{order.orderCode}</td>
                                    <td>
                                        <div className={styles.customerInfo}>
                                            <span className={styles.customerName}>{order.receiverName || 'Unknown'}</span>
                                            <span className={styles.customerPhone}>{order.receiverPhone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className={styles.totalPrice}>${(order.totalPrice || 0).toFixed(2)}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                                            {order.status || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <div className={styles.moreMenuWrapper}>
                                                <button
                                                    className={`${styles.moreBtn} ${activeMenu === order.id ? styles.moreBtnActive : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === order.id ? null : order.id);
                                                    }}
                                                >
                                                    <BiDotsVerticalRounded />
                                                </button>
                                                {activeMenu === order.id && (
                                                    <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                                            <BiShow /> View Details
                                                        </button>
                                                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                                            <button
                                                                className={styles.cancelAction}
                                                                onClick={() => {
                                                                    openConfirmModal(order, 'cancel');
                                                                    setActiveMenu(null);
                                                                }}
                                                            >
                                                                <BiXCircle /> Cancel Order
                                                            </button>
                                                        )}
                                                        <button
                                                            className={styles.deleteAction}
                                                            onClick={() => {
                                                                openConfirmModal(order, 'delete');
                                                                setActiveMenu(null);
                                                            }}
                                                        >
                                                            <BiTrash /> Delete Order
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className={styles.noData}>No orders found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalType === 'delete' ? handleDeleteOrder : handleCancelOrder}
                title={modalType === 'delete' ? 'Confirm Delete' : 'Confirm Cancel'}
                message={modalType === 'delete' ? 'Are you sure you want to delete' : 'Are you sure you want to cancel'}
                itemName={`#${selectedOrder?.id}`}
                confirmText={modalType === 'delete' ? 'Delete' : 'Confirm'}
                confirmColor={modalType === 'delete' ? '#dc2626' : '#f97316'}
            />

            <ConfirmModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onConfirm={handleBulkDelete}
                title="Confirm Bulk Delete"
                message={`Are you sure you want to delete ${selectedIds.length} orders?`}
                itemName="selected orders"
                confirmText="Delete All"
                confirmColor="#dc2626"
            />
        </div>
    );
};

export default OrderList;
