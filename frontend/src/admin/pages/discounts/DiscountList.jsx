import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import {
    BiPlus,
    BiPencil,
    BiTrash,
    BiSearch,
    BiShow,
    BiHide,
    BiPurchaseTag
} from 'react-icons/bi';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './DiscountList.module.css';

const DiscountList = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/discounts');
            setDiscounts(response.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
            toast.error('Failed to load discounts');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(`/discounts/${id}/toggle`);
            toast.success('Status updated successfully');
            fetchDiscounts();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!discountToDelete) return;
        try {
            await axios.delete(`/discounts/${discountToDelete.id}`);
            toast.success('Discount deleted successfully');
            setShowDeleteModal(false);
            setDiscountToDelete(null);
            fetchDiscounts();
        } catch (error) {
            console.error('Error deleting discount:', error);
            toast.error('Failed to delete discount');
        }
    };

    const filteredDiscounts = discounts.filter(d => 
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'No limit';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Discounts</h1>
                <button 
                    className={styles.addButton}
                    onClick={() => navigate('/admin/discounts/add')}
                >
                    <BiPlus /> Create Discount
                </button>
            </div>

            <div className={styles.searchBar}>
                <div className={styles.searchContainer}>
                    <BiSearch className={styles.searchIcon} />
                    <input 
                        type="text" 
                        placeholder="Search by code or description..." 
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>Loading discounts...</div>
                ) : filteredDiscounts.length === 0 ? (
                    <div className={styles.empty}>No discounts found</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Usage</th>
                                <th>Active Period</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDiscounts.map((discount) => (
                                <tr key={discount.id}>
                                    <td>
                                        <div className={styles.codeCell}>
                                            <BiPurchaseTag className={styles.tagIcon} />
                                            <span className={styles.codeText}>{discount.code}</span>
                                        </div>
                                    </td>
                                    <td>{discount.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}</td>
                                    <td>
                                        <span className={styles.valueText}>
                                            {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.usageCell}>
                                            <span>{discount.usageCount} / {discount.usageLimit || '∞'}</span>
                                            <div className={styles.usageBar}>
                                                <div 
                                                    className={styles.usageProgress} 
                                                    style={{ width: `${discount.usageLimit ? (discount.usageCount / discount.usageLimit * 100) : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.dateCell}>
                                            <span>{formatDate(discount.startDate)}</span>
                                            <span className={styles.dateSeparator}>to</span>
                                            <span>{formatDate(discount.endDate)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${discount.isActive ? styles.active : styles.inactive}`}>
                                            {discount.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button 
                                            className={`${styles.actionButton} ${styles.toggleBtn}`}
                                            onClick={() => handleToggleStatus(discount.id)}
                                            title={discount.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {discount.isActive ? <BiHide /> : <BiShow />}
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.editBtn}`}
                                            onClick={() => navigate(`/admin/discounts/edit/${discount.id}`)}
                                            title="Edit"
                                        >
                                            <BiPencil />
                                        </button>
                                        <button 
                                            className={`${styles.actionButton} ${styles.deleteBtn}`}
                                            onClick={() => {
                                                setDiscountToDelete(discount);
                                                setShowDeleteModal(true);
                                            }}
                                            title="Delete"
                                        >
                                            <BiTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Delete Discount</h3>
                        <p>Are you sure you want to delete <strong>{discountToDelete?.code}</strong>? This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className={styles.confirmBtn} onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountList;
