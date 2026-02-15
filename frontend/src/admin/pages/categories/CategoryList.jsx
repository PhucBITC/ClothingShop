import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import { BiPencil, BiTrash, BiPlus, BiError } from 'react-icons/bi';
import styles from './CategoryList.module.css';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const navigate = useNavigate();

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

        try {
            await axios.delete(`/categories/${categoryToDelete.id}`);
            setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
    };

    if (loading) return <div className={styles.loading}>Loading categories...</div>;
    if (error) return <div className={styles.error}><BiError /> {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>All Categories</h2>
                <Link to="/admin/categories/add" className={styles.addButton}>
                    <BiPlus size={20} /> Add Category
                </Link>
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
                        {categories.length > 0 ? (
                            categories.map((category) => (
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
