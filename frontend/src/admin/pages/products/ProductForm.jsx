import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import styles from './ProductForm.module.css';
import { motion } from 'framer-motion';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        categoryId: ''
    });

    const [variants, setVariants] = useState([
        { size: '', color: '', stock: '', price: '' }
    ]);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const catResponse = await axios.get('/categories');
                setCategories(Array.isArray(catResponse.data) ? catResponse.data : []);

                if (isEditMode) {
                    const productResponse = await axios.get(`/products/${id}`);
                    const product = productResponse.data;

                    setFormData({
                        name: product.name,
                        description: product.description,
                        basePrice: product.basePrice,
                        categoryId: product.category?.id || ''
                    });

                    // Load Variants
                    if (product.variants && product.variants.length > 0) {
                        setVariants(product.variants.map(v => ({
                            size: v.size,
                            color: v.color,
                            stock: v.stock,
                            price: v.price
                        })));
                    }

                    // Load Images
                    if (product.images && product.images.length > 0) {
                        setExistingImages(product.images);
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Variant Handlers
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { size: '', color: '', stock: '', price: '' }]);
    };

    const removeVariant = (index) => {
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
    };

    // File Handlers
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name || !formData.basePrice || !formData.categoryId) {
            setError("Vui lòng điền các trường bắt buộc.");
            setLoading(false);
            return;
        }

        try {
            const productData = {
                ...formData,
                basePrice: parseFloat(formData.basePrice),
                categoryId: parseInt(formData.categoryId, 10),
                variants: variants.map(v => ({
                    ...v,
                    stock: parseInt(v.stock, 10),
                    price: v.price ? parseFloat(v.price) : null
                }))
            };

            const data = new FormData();
            data.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));

            selectedFiles.forEach(file => {
                data.append("files", file);
            });

            if (isEditMode) {
                await axios.put(`/products/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/admin/products');
        } catch (err) {
            console.error("Error saving product:", err);
            setError("Lỗi khi lưu sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.name) return <div className={styles.loadingOverlay}>Loading...</div>;

    return (
        <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className={styles.title}>{isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                {/* Basic Info */}
                <div className={styles.section}>
                    <h3>Thông Tin Cơ Bản</h3>
                    <div className={styles.formGroup}>
                        <label>Tên Sản Phẩm *</label>
                        <input name="name" value={formData.name} onChange={handleInputChange} required className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Giá Cơ Bản (VND) *</label>
                        <input type="number" name="basePrice" value={formData.basePrice} onChange={handleInputChange} required className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Danh Mục *</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className={styles.select}>
                            <option value="">-- Chọn Danh Mục --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Mô Tả</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} className={styles.textarea} />
                    </div>
                </div>

                {/* Variants */}
                <div className={styles.section}>
                    <h3>Biến Thể (Size/Màu)</h3>
                    {variants.map((variant, index) => (
                        <div key={index} className={styles.variantRow}>
                            <input placeholder="Size (VD: M, L)" value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} required />
                            <input placeholder="Màu (VD: Đen, Trắng)" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} required />
                            <input type="number" placeholder="Tồn kho" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} required />
                            <input type="number" placeholder="Giá riêng (tùy chọn)" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} />
                            <button type="button" onClick={() => removeVariant(index)} className={styles.btnDanger}>Xóa</button>
                        </div>
                    ))}
                    <button type="button" onClick={addVariant} className={styles.btnAdd}>+ Thêm Biến Thể</button>
                </div>

                {/* Images */}
                <div className={styles.section}>
                    <h3>Hình Ảnh</h3>
                    <input type="file" multiple onChange={handleFileChange} className={styles.fileInput} />
                    <div className={styles.previewContainer}>
                        {existingImages.map((img, idx) => (
                            <img key={idx} src={img.imageUrl} alt="Existing" className={styles.previewImg} />
                        ))}
                        {previewImages.map((src, idx) => (
                            <div key={idx} className={styles.previewWrapper}>
                                <img src={src} alt="Preview" className={styles.previewImg} />
                                <button type="button" onClick={() => removeSelectedFile(idx)} className={styles.btnRemoveImg}>X</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={() => navigate('/admin/products')} className={styles.btnSecondary}>Hủy</button>
                    <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? 'Đang Lưu...' : 'Lưu Sản Phẩm'}</button>
                </div>
            </form>
        </motion.div>
    );
};

export default ProductForm;
