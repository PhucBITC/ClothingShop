import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import styles from './CategoryForm.module.css';
import { motion } from 'framer-motion';

const CategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        categoryType: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const CATEGORY_TYPES = [
        'MEN',
        'WOMEN',
        'KIDS',
        'FOOTWEAR',
        'ACCESSORIES',
        'TRADITIONAL_WEAR',
        'NEW_ARRIVALS'
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            console.log("Fetching category with ID:", id);
            const response = await axios.get(`/categories/${id}`);
            console.log("Category data received:", response.data);
            setFormData({
                name: response.data.name || '',
                categoryType: response.data.categoryType || '',
                description: response.data.description || ''
            });
        } catch (err) {
            console.error("Error fetching category:", err);
            setError('Failed to fetch category details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name || !formData.categoryType) {
            setError("Please fill in all required fields.");
            setLoading(false);
            return;
        }

        try {
            if (isEditMode) {
                await axios.put(`/categories/${id}`, formData);
            } else {
                await axios.post('/categories', formData);
            }
            navigate('/admin/categories');
        } catch (err) {
            setError('Failed to save category. Please try again.');
            setLoading(false);
        }
    };

    if (loading && !formData.name) return <div className={styles.loadingOverlay}>Loading...</div>;

    return (
        <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className={styles.title}>{isEditMode ? 'Edit Category' : 'Add New Category'}</h2>
            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                <div className={styles.section}>
                    <h3>Basic Information</h3>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="e.g. Sneakers"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category Type *</label>
                        <select
                            name="categoryType"
                            value={formData.categoryType}
                            onChange={handleChange}
                            required
                            className={styles.select}
                        >
                            <option value="">-- Select Type --</option>
                            {CATEGORY_TYPES.map(type => (
                                <option key={type} value={type}>
                                    {type.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Category description..."
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={() => navigate('/admin/categories')} className={styles.btnSecondary}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className={styles.btnPrimary}>
                        {loading ? 'Saving...' : 'Save Category'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default CategoryForm;
