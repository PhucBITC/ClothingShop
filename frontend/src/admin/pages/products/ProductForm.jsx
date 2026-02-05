import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../api/axios'; // Use configured instance
import styles from './ProductForm.module.css';
import { motion } from 'framer-motion';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: '',
        image: ''
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Categories and Product Data (if edit mode)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Categories
                const catResponse = await axios.get('/categories');
                if (Array.isArray(catResponse.data)) {
                    setCategories(catResponse.data);
                } else {
                    console.error("Categories API response is not an array:", catResponse.data);
                    setCategories([]);
                }

                // If Edit Mode, Fetch Product
                if (isEditMode) {
                    const productResponse = await axios.get(`/products/${id}`);
                    const product = productResponse.data;
                    setFormData({
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        stockQuantity: product.stockQuantity,
                        categoryId: product.category ? product.category.id : '',
                        image: product.image
                    });
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEditMode]);

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

        // Basic Validation
        if (!formData.name || !formData.price || !formData.categoryId) {
            setError("Vui lòng điền đầy đủ các trường bắt buộc.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stockQuantity, 10),
                category: { id: parseInt(formData.categoryId, 10) } // Backend expects object with ID
            };

            // Remove flat categoryId from payload to match Entity structure if needed, 
            // but usually sending the object is safer for specific mapping.
            // Let's stick to the structure the backend likely expects based on typical Spring Boot User/Product models.
            // If the backend uses DTOs, this might need adjustment, but standard Entities often accept this.

            if (isEditMode) {
                await axios.put(`/products/${id}`, payload);
            } else {
                await axios.post('/products', payload);
            }
            navigate('/admin/products');
        } catch (err) {
            console.error("Error saving product:", err);
            setError("Lỗi khi lưu sản phẩm. Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.name) return <div className={styles.loadingOverlay}>Loading...</div>;

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className={styles.title}>{isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>

            {error && <div className={styles.errorMsg} style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                {/* Name */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Tên Sản Phẩm *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Nhập tên sản phẩm"
                        required
                    />
                </div>

                {/* Price */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Giá (VND) *</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="0"
                        min="0"
                        required
                    />
                </div>

                {/* Stock */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Số Lượng Tồn Kho *</label>
                    <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="0"
                        min="0"
                        required
                    />
                </div>

                {/* Category */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Danh Mục *</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className={styles.select}
                        required
                    >
                        <option value="">-- Chọn Danh Mục --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Image URL */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>URL Hình Ảnh (Link)</label>
                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                {/* Image Preview */}
                <div className={styles.imagePreviewContainer}>
                    <div className={styles.imagePreview}>
                        {formData.image ? (
                            <img src={formData.image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                            <span>No Image Preview</span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Mô Tả</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={styles.textarea}
                        placeholder="Mô tả chi tiết sản phẩm..."
                    />
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button type="button" onClick={() => navigate('/admin/products')} className={`${styles.btn} ${styles.btnSecondary}`}>
                        Hủy Bỏ
                    </button>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
                        {loading ? 'Đang Lưu...' : (isEditMode ? 'Cập Nhật' : 'Tạo Mới')}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ProductForm;
