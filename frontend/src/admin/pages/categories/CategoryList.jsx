import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import { BiPencil, BiTrash, BiPlus, BiError } from 'react-icons/bi';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './CategoryList.module.css';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/categories');
            setCategories(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        const loadingToastId = toast.loading('Deleting...', `Deleting category "${categoryToDelete.name}"`);

        try {
            await axios.delete(`/categories/${categoryToDelete.id}`);
            setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
            setShowDeleteModal(false);
            setCategoryToDelete(null);

            toast.remove(loadingToastId);
            toast.success('Deleted Successfully', `Category "${categoryToDelete.name}" has been removed.`);
        } catch (err) {
            toast.remove(loadingToastId);
            toast.error('Delete Failed', err.response?.data?.message || 'Failed to delete category. Check if it has associated products.');
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
    };

    if (loading) return <div className={styles.loading}>Loading categories...</div>;
    if (error) return <div className={styles.error}><BiError /> {error}</div>;

    const types = ['ALL', ...new Set(categories.map(cat => cat.categoryType).filter(Boolean))];

    const filteredCategories = activeTab === 'ALL' 
        ? categories 
        : categories.filter(cat => cat.categoryType === activeTab);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>All Categories</h2>
                <Link to="/admin/categories/add" className={styles.addButton}>
                    <BiPlus size={20} /> Add Category
                </Link>
            </div>

            <div className={styles.tabs}>
                {types.map(type => (
                    <button
                        key={type}
                        className={`${styles.tab} ${activeTab === type ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <tr key={category.id}>
                                    <td className={styles.categoryName}>{category.name}</td>
                                    <td>
                                        <span className={styles.typeBadge}>
                                            {category.categoryType || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{category.description}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={`${styles.actionButton} ${styles.editBtn}`}
                                                title="Edit"
                                                onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
                                            >
                                                <BiPencil size={18} />
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteBtn}`}
                                                title="Delete"
                                                onClick={() => confirmDelete(category)}
                                            >
                                                <BiTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                    No categories found. Start by adding one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Custom Delete Modal */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?</p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={cancelDelete}>Cancel</button>
                            <button className={styles.confirmBtn} onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;
