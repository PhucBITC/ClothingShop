import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './ProductForm.module.css';
import { motion } from 'framer-motion';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        categoryId: '',
        metaTitle: '',
        metaDescription: '',
        tags: '',
        weight: '',
        length: '',
        width: '',
        height: ''
    });

    const [variants, setVariants] = useState([
        { size: '', color: '', stock: '', price: '', salePrice: '' }
    ]);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Keep local error for initial fetch, but use toast for form submission

    // Two-step category selection state
    const [selectedType, setSelectedType] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);

    // Slug Preview
    const [slugPreview, setSlugPreview] = useState('');

    const CATEGORY_TYPES = [
        'MEN', 'WOMEN', 'KIDS', 'FOOTWEAR', 'ACCESSORIES', 'TRADITIONAL_WEAR', 'NEW_ARRIVALS'
    ];

    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    const FOOTWEAR_ADULT_SIZES = Array.from({ length: 46 - 35 + 1 }, (_, i) => (35 + i).toString());
    const FOOTWEAR_KIDS_SIZES = Array.from({ length: 34 - 19 + 1 }, (_, i) => (19 + i).toString());
    const COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Gray', 'Pink', 'Purple', 'Orange', 'Brown', 'Beige', 'Navy', 'Maroon', 'Charcoal'];

    // Specialized Logic States
    const [footwearGroup, setFootwearGroup] = useState('ADULT'); // ADULT or KIDS
    const [accessorySubType, setAccessorySubType] = useState('NONE'); // NONE, DIMENSIONS, MEASUREMENT
    const [accessoryUnit, setAccessoryUnit] = useState('cm');

    // Bulk Update State
    const [bulkPrice, setBulkPrice] = useState('');
    const [bulkStock, setBulkStock] = useState('');

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
                        name: product.name || '',
                        description: product.description || '',
                        basePrice: product.basePrice || '',
                        categoryId: product.category?.id || '',
                        metaTitle: product.metaTitle || '',
                        metaDescription: product.metaDescription || '',
                        tags: product.tags || '',
                        weight: product.weight || '',
                        length: product.length || '',
                        width: product.width || '',
                        height: product.height || ''
                    });

                    if (product.slug) setSlugPreview(product.slug);

                    // Load Variants
                    if (product.variants && product.variants.length > 0) {
                        setVariants(product.variants.map(v => ({
                            size: v.size || '',
                            color: v.color || '',
                            stock: v.stock || '',
                            price: v.price || '',
                            salePrice: v.salePrice || ''
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
                toast.error("Load Failed", "Failed to load product data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode, toast]);

    // Filter categories when Type changes
    useEffect(() => {
        if (selectedType) {
            const filtered = categories.filter(c => c.categoryType === selectedType);
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories([]);
        }
    }, [selectedType, categories]);

    // Set initial Type
    useEffect(() => {
        if (formData.categoryId && categories.length > 0) {
            const selectedCat = categories.find(c => c.id === parseInt(formData.categoryId));
            if (selectedCat && selectedCat.categoryType !== selectedType) {
                setSelectedType(selectedCat.categoryType);
            }
        }
    }, [formData.categoryId, categories, selectedType]);

    // Auto-generate Slug Preview
    useEffect(() => {
        if (!isEditMode && formData.name) {
            const slug = formData.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");
            setSlugPreview(slug);
        }
    }, [formData.name, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        setFormData(prev => ({ ...prev, categoryId: '' }));
        // Reset specialized states
        setFootwearGroup('ADULT');
        setAccessorySubType('NONE');
    };

    // Variant Handlers
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleDimensionChange = (index, dimIndex, value) => {
        const newVariants = [...variants];
        let currentSize = newVariants[index].size || '0x0x0';
        // Handle cases where size might be "Free size" or empty
        if (!currentSize.includes('x')) currentSize = '0x0x0';
        let dims = currentSize.replace(' cm', '').split('x');
        if (dims.length !== 3) dims = ['0', '0', '0'];
        dims[dimIndex] = value || '0';
        newVariants[index].size = `${dims.join('x')} cm`;
        setVariants(newVariants);
    };

    const handleMeasurementChange = (index, value) => {
        const newVariants = [...variants];
        newVariants[index].size = `${value}${accessoryUnit}`;
        setVariants(newVariants);
    };

    const addVariant = () => {
        let initialSize = '';
        if (selectedType === 'ACCESSORIES' && accessorySubType === 'NONE') {
            initialSize = 'Free size';
        }
        setVariants([...variants, { size: initialSize, color: '', stock: '', price: '', salePrice: '' }]);
    };

    const removeVariant = (index) => {
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
    };

    const applyBulkUpdate = () => {
        const newVariants = variants.map(v => ({
            ...v,
            price: bulkPrice || v.price,
            stock: bulkStock || v.stock
        }));
        setVariants(newVariants);
        setBulkPrice('');
        setBulkStock('');
        toast.info('Batch Update Applied', 'Price and stock updated for all variants.');
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

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const moveExistingImage = (index, direction) => {
        const newImages = [...existingImages];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newImages.length) return;

        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];

        // Ensure only the first image is primary if we move things around
        const updatedImages = newImages.map((img, i) => ({
            ...img,
            primary: i === 0
        }));

        setExistingImages(updatedImages);
    };

    const setAsPrimary = (index) => {
        const updatedImages = existingImages.map((img, i) => ({
            ...img,
            primary: i === index
        }));
        setExistingImages(updatedImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.basePrice || !formData.categoryId) {
            toast.error("Validation Error", "Please fill in all required fields.");
            setLoading(false);
            return;
        }

        try {
            const productData = {
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0,
                categoryId: parseInt(formData.categoryId, 10) || null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                length: formData.length ? parseFloat(formData.length) : null,
                width: formData.width ? parseFloat(formData.width) : null,
                height: formData.height ? parseFloat(formData.height) : null,
                variants: variants.map(v => ({
                    ...v,
                    stock: parseInt(v.stock, 10) || 0,
                    price: v.price ? parseFloat(v.price) : null,
                    salePrice: v.salePrice ? parseFloat(v.salePrice) : null
                })),
                images: existingImages.map(img => ({
                    imageUrl: img.imageUrl,
                    primary: img.primary
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
                toast.success('Success', `Product "${formData.name}" has been updated.`);
            } else {
                await axios.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Success', `Product "${formData.name}" has been added.`);
            }
            navigate('/admin/products');
        } catch (err) {
            console.error("Error saving product:", err);
            const serverMessage = err.response?.headers?.['x-error-message'] || err.response?.data;
            const errorMessage = serverMessage || 'Failed to save product. Please try again.';
            toast.error('Save Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.name && isEditMode) return <div className={styles.loadingOverlay}>Loading...</div>;

    return (
        <motion.div className={styles.container}>
            <h2 className={styles.title}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                {/* LEFT COLUMN: Main Info, Variants, Images */}
                <div className={styles.leftColumn}>

                    {/* Basic Information */}
                    <div className={styles.section}>
                        <h3>Basic Information</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Product Name *</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} required className={styles.input} placeholder="e.g. Premium Cotton T-Shirt" />
                            {slugPreview && <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>Slug: {slugPreview}</small>}
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} className={styles.textarea} placeholder="Detailed product description..." />
                        </div>

                        {/* Categories Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category Type *</label>
                                <select value={selectedType} onChange={handleTypeChange} className={styles.select}>
                                    <option value="">-- Select Type --</option>
                                    {CATEGORY_TYPES.map(type => (
                                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category Name *</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.select}
                                    disabled={!selectedType}
                                >
                                    <option value="">-- Select Category --</option>
                                    {filteredCategories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Product Variants</h3>
                            <button type="button" onClick={addVariant} className={styles.btnAdd}>
                                <span>+</span> Add Variant
                            </button>
                        </div>

                        {/* Bulk Update Tool */}
                        <div className={styles.bulkUpdate}>
                            <div className={styles.bulkHeader}>Batch Update</div>
                            <div className={styles.bulkControls}>
                                <input placeholder="Set Price ($)" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} className={styles.input} style={{ width: '140px' }} type="number" />
                                <input placeholder="Set Stock" value={bulkStock} onChange={e => setBulkStock(e.target.value)} className={styles.input} style={{ width: '140px' }} type="number" />
                                <button type="button" onClick={applyBulkUpdate} className={styles.btnAdd} style={{ background: 'white' }}>Apply to All</button>
                            </div>
                        </div>

                        {/* Variant Table */}
                        <div className={styles.variantTable}>
                            {/* Specialized Group Selectors */}
                            {(selectedType === 'FOOTWEAR' || selectedType === 'ACCESSORIES') && (
                                <div className={styles.categorySpecialOptions}>
                                    {selectedType === 'FOOTWEAR' && (
                                        <div className={styles.radioGroup}>
                                            <span style={{ fontWeight: 600, marginRight: '12px' }}>Footwear Type:</span>
                                            <label>
                                                <input type="radio" name="fwGroup" checked={footwearGroup === 'ADULT'} onChange={() => setFootwearGroup('ADULT')} /> Adult (35-46)
                                            </label>
                                            <label style={{ marginLeft: '16px' }}>
                                                <input type="radio" name="fwGroup" checked={footwearGroup === 'KIDS'} onChange={() => setFootwearGroup('KIDS')} /> Kids (19-34)
                                            </label>
                                        </div>
                                    )}
                                    {selectedType === 'ACCESSORIES' && (
                                        <div className={styles.subTypeSelect}>
                                            <label style={{ fontWeight: 600, marginRight: '8px' }}>Size Format: </label>
                                            <select value={accessorySubType} onChange={(e) => setAccessorySubType(e.target.value)} className={styles.select} style={{ width: 'auto' }}>
                                                <option value="NONE">No size (Free size)</option>
                                                <option value="DIMENSIONS">Dimensions (LxWxH)</option>
                                                <option value="MEASUREMENT">Measured (e.g. 90cm)</option>
                                            </select>
                                            {accessorySubType === 'MEASUREMENT' && (
                                                <select value={accessoryUnit} onChange={(e) => setAccessoryUnit(e.target.value)} className={styles.select} style={{ width: 'auto', marginLeft: '8px' }}>
                                                    <option value="cm">cm</option>
                                                    <option value="mm">mm</option>
                                                </select>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={styles.variantHeader}>
                                <span className={styles.variantLabel}>Size</span>
                                <span className={styles.variantLabel}>Color</span>
                                <span className={styles.variantLabel}>Stock</span>
                                <span className={styles.variantLabel}>Price ($)</span>
                                <span className={styles.variantLabel}>Sale ($)</span>
                                <span></span>
                            </div>

                            {variants.map((variant, index) => (
                                <div key={index} className={styles.variantRow}>
                                    {/* DYNAMIC SIZE INPUT */}
                                    {selectedType === 'FOOTWEAR' ? (
                                        <select value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} required className={styles.select}>
                                            <option value="">Size</option>
                                            {(footwearGroup === 'ADULT' ? FOOTWEAR_ADULT_SIZES : FOOTWEAR_KIDS_SIZES).map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    ) : selectedType === 'ACCESSORIES' ? (
                                        accessorySubType === 'NONE' ? (
                                            <input value="Free size" disabled className={styles.input} />
                                        ) : accessorySubType === 'DIMENSIONS' ? (
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <input type="number" placeholder="L" className={styles.input} style={{ padding: '6px', width: '60px' }} onChange={(e) => handleDimensionChange(index, 0, e.target.value)} />
                                                <span style={{ fontSize: '12px' }}>x</span>
                                                <input type="number" placeholder="W" className={styles.input} style={{ padding: '6px', width: '60px' }} onChange={(e) => handleDimensionChange(index, 1, e.target.value)} />
                                                <span style={{ fontSize: '12px' }}>x</span>
                                                <input type="number" placeholder="H" className={styles.input} style={{ padding: '6px', width: '60px' }} onChange={(e) => handleDimensionChange(index, 2, e.target.value)} />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <input type="number" placeholder="Value" className={styles.input} onChange={(e) => handleMeasurementChange(index, e.target.value)} />
                                                <span style={{ fontWeight: 600 }}>{accessoryUnit}</span>
                                            </div>
                                        )
                                    ) : (
                                        <select value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} required className={styles.select}>
                                            <option value="">Size</option>
                                            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    )}

                                    <select value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} required className={styles.select}>
                                        <option value="">Select Color</option>
                                        {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>

                                    <input type="number" placeholder="0" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} required className={styles.input} min="0" />
                                    <input type="number" placeholder="Override" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} className={styles.input} min="0" step="0.01" />
                                    <input type="number" placeholder="Sale" value={variant.salePrice} onChange={e => handleVariantChange(index, 'salePrice', e.target.value)} className={styles.input} min="0" step="0.01" />

                                    <button type="button" onClick={() => removeVariant(index)} className={styles.btnDanger} title="Remove Variant">
                                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>×</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className={styles.section}>
                        <h3>Product Images</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <input type="file" multiple onChange={handleFileChange} id="fileInput" className={styles.fileInput} style={{ display: 'none' }} accept="image/*" />
                            <label htmlFor="fileInput" className={styles.fileInput} style={{ display: 'block' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#9ca3af' }}>☁️</div>
                                <div style={{ color: '#4b5563', fontWeight: 500 }}>Click to upload images</div>
                                <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>or drag and drop files here</div>
                            </label>
                        </div>

                        <div className={styles.previewContainer}>
                            {existingImages.map((img, idx) => (
                                <div key={img.id || `ex-${idx}`} className={styles.previewWrapper}>
                                    <img src={img.imageUrl} alt="Existing" className={styles.previewImg} />
                                    <div className={styles.imgBadge}>
                                        {img.primary ? 'Primary' : 'Secondary'}
                                    </div>
                                    <div className={styles.imgActions}>
                                        <button type="button" onClick={() => moveExistingImage(idx, -1)} disabled={idx === 0} className={styles.btnAction} title="Move Left">←</button>
                                        <button type="button" onClick={() => moveExistingImage(idx, 1)} disabled={idx === existingImages.length - 1} className={styles.btnAction} title="Move Right">→</button>
                                        <button type="button" onClick={() => setAsPrimary(idx)} disabled={img.primary} className={styles.btnAction} title="Set as Primary">★</button>
                                        <button type="button" onClick={() => removeExistingImage(idx)} className={styles.btnRemoveImgSmall}>✕</button>
                                    </div>
                                </div>
                            ))}
                            {previewImages.map((src, idx) => (
                                <div key={`new-${idx}`} className={styles.previewWrapper}>
                                    <img src={src} alt="Preview" className={styles.previewImg} />
                                    <div className={styles.imgBadge}>New</div>
                                    <button type="button" onClick={() => removeSelectedFile(idx)} className={styles.btnRemoveImg}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Status, SEO, Shipping */}
                <div className={styles.rightColumn}>
                    {/* Actions Card */}
                    <div className={styles.section}>
                        <h3>Publish</h3>
                        <div className={styles.actions}>
                            <button type="submit" className={styles.btnPrimary} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                            <button type="button" onClick={() => navigate('/admin/products')} className={styles.btnSecondary}>
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className={styles.section}>
                        <h3>Pricing</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Base Price ($) *</label>
                            <input type="number" name="basePrice" value={formData.basePrice} onChange={handleInputChange} required className={styles.input} placeholder="0.00" min="0" step="0.01" />
                            <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>Default price for all variants</small>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className={styles.section}>
                        <h3>Shipping Info</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Weight (gram)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className={styles.input} placeholder="e.g. 500" />
                        </div>
                        <label className={styles.label}>Dimensions (cm)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            <input type="number" name="length" placeholder="L" value={formData.length} onChange={handleInputChange} className={styles.input} />
                            <input type="number" name="width" placeholder="W" value={formData.width} onChange={handleInputChange} className={styles.input} />
                            <input type="number" name="height" placeholder="H" value={formData.height} onChange={handleInputChange} className={styles.input} />
                        </div>
                    </div>

                    {/* SEO & Tags */}
                    <div className={styles.section}>
                        <h3>SEO & Organization</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tags</label>
                            <input name="tags" value={formData.tags} onChange={handleInputChange} className={styles.input} placeholder="summer, cotton, sale" />
                            <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>Comma separated</small>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Meta Title</label>
                            <input name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className={styles.input} placeholder={formData.name || "Product Title"} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Meta Description</label>
                            <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} className={styles.textarea} style={{ minHeight: '80px' }} placeholder="Description for search engines..." />
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default ProductForm;
