import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import { BiPlus, BiPencil, BiTrash, BiError, BiCopy, BiSearch, BiFilter } from 'react-icons/bi';
import styles from './ProductList.module.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter & Pagination State
    const [filters, setFilters] = useState({
        keyword: '',
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        tag: ''
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [categories, setCategories] = useState([]);

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, filters.categoryId]); // Refetch when page or category changes immediately (optional, or wait for apply)

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            if (Array.isArray(res.data)) setCategories(res.data);
        } catch (e) {
            console.error("Failed to load categories");
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: page,
                size: 2,
                keyword: filters.keyword,
                categoryId: filters.categoryId,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                tag: filters.tag
            };

            // Remove empty params
            Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

            const response = await axios.get('/products/search', { params });

            if (response.data && response.data.content) {
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            } else {
                setProducts([]);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        setPage(0);
        fetchProducts();
    };

    const handleResetFilters = () => {
        setFilters({
            keyword: '',
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            tag: ''
        });
        setPage(0);
        // fetchProducts() will be triggered by useEffect logic if we add dependencies, 
        // but here we manually call it or wait for user to click Apply. 
        // Let's manually call it to be responsive.
        setTimeout(() => fetchProducts(), 100);
    };

    const handleDuplicate = async (product) => {
        if (!window.confirm(`Duplicate product "${product.name}"?`)) return;

        try {
            const res = await axios.post(`/products/${product.id}/duplicate`);
            alert("Product duplicated successfully!");
            // Navigate to edit the new product
            navigate(`/admin/products/edit/${res.data.id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to duplicate product");
        }
    };

    const confirmDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            await axios.delete(`/products/${productToDelete.id}`);
            fetchProducts(); // Refresh list
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (err) {
            alert("Failed to delete product");
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const primary = product.images.find(img => img.primary);
            return primary ? primary.imageUrl : product.images[0].imageUrl;
        }
        return 'https://via.placeholder.com/48';
    };

    const getStockInfo = (product) => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        }
        return product.stock || 0;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Products Management</h2>
                <button className={styles.addButton} onClick={() => navigate('/admin/products/add')}>
                    <BiPlus size={20} />
                    Add Product
                </button>
            </div>

            <div className={styles.layout}>
                {/* Sidebar Filters */}
                <div className={styles.sidebar}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BiFilter /> Filters
                    </h3>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Keyword</label>
                        <input name="keyword" value={filters.keyword} onChange={handleFilterChange} className={styles.filterInput} placeholder="Search name, desc..." />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Category</label>
                        <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className={styles.filterSelect}>
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Price Range</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} className={styles.filterInput} placeholder="Min" />
                            <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} className={styles.filterInput} placeholder="Max" />
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Tag</label>
                        <input name="tag" value={filters.tag} onChange={handleFilterChange} className={styles.filterInput} placeholder="e.g. sale" />
                    </div>

                    <button className={styles.btnApply} onClick={handleApplyFilters}>Apply Filters</button>
                    <button className={styles.btnReset} onClick={handleResetFilters}>Reset</button>
                </div>

                {/* Main Content */}
                <div className={styles.content}>
                    {loading ? <div className={styles.loading}>Loading products...</div> :
                        error ? <div className={styles.error}><BiError /> {error}</div> : (
                            <>
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length > 0 ? (
                                                products.map((product) => {
                                                    const stock = getStockInfo(product);
                                                    const imageUrl = getProductImage(product);
                                                    return (
                                                        <tr key={product.id}>
                                                            <td className={styles.productInfo}>
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={product.name}
                                                                    className={styles.productImage}
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/48' }}
                                                                />
                                                                <div>
                                                                    <div className={styles.productName}>{product.name}</div>
                                                                    {product.slug && <small style={{ color: '#666', fontSize: '11px' }}>{product.slug}</small>}
                                                                </div>
                                                            </td>
                                                            <td>{product.category?.name || 'Uncategorized'}</td>
                                                            <td className={styles.price}>
                                                                ${product.basePrice ? product.basePrice.toLocaleString() : '0.00'}
                                                            </td>
                                                            <td>
                                                                <span className={`${styles.stockBadge} ${stock > 0 ? styles.inStock : styles.outOfStock}`}>
                                                                    {stock}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className={styles.actions}>
                                                                    <button className={`${styles.actionButton} ${styles.editBtn}`} title="Duplicate" onClick={() => handleDuplicate(product)}>
                                                                        <BiCopy size={18} />
                                                                    </button>
                                                                    <button className={`${styles.actionButton} ${styles.editBtn}`} title="Edit" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                                                                        <BiPencil size={18} />
                                                                    </button>
                                                                    <button className={`${styles.actionButton} ${styles.deleteBtn}`} title="Delete" onClick={() => confirmDelete(product)}>
                                                                        <BiTrash size={18} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                                        No products found matching filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className={styles.pagination}>
                                    <button
                                        className={styles.pageBtn}
                                        disabled={page === 0}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            className={`${styles.pageBtn} ${page === i ? styles.active : ''}`}
                                            onClick={() => setPage(i)}
                                        >
                                            {i + 1}
                                        </button>
                                    )).slice(Math.max(0, page - 2), Math.min(totalPages, page + 3))}
                                    <button
                                        className={styles.pageBtn}
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </button>
                                    <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                                        Total: {totalElements}
                                    </span>
                                </div>
                            </>
                        )}
                </div>
            </div>

            {/* Custom Delete Modal */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete <strong>{productToDelete?.name}</strong>?</p>
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

export default ProductList;
