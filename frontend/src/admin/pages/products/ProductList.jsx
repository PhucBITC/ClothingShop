import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import {
    BiPlus,
    BiPencil,
    BiTrash,
    BiError,
    BiCopy,
    BiSearch,
    BiFilter,
    BiChevronLeft,
    BiChevronRight,
    BiShow,
    BiHide
} from 'react-icons/bi';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './ProductList.module.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

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
    const [showHideSuggestion, setShowHideSuggestion] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

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
                size: 5,
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
        if (isProcessing) return;
        const confirmMsg = `Duplicate product "${product.name}"?`;
        if (!window.confirm(confirmMsg)) return;

        setIsProcessing(true);
        const toastId = toast.loading('Duplicating...', `Creating a copy of ${product.name}`);

        // Safety timeout to reset processing state if request hangs indefinitely
        const safetyTimeout = setTimeout(() => setIsProcessing(false), 15000);

        try {
            const res = await axios.post(`/products/${product.id}/duplicate`);
            clearTimeout(safetyTimeout);
            toast.success('Duplicated', `Product duplicated successfully!`, { id: toastId });
            setIsProcessing(false);
            // Navigate to edit the new product
            navigate(`/admin/products/edit/${res.data.id}`);
        } catch (err) {
            clearTimeout(safetyTimeout);
            console.error(err);
            toast.error('Duplicate Failed', 'Failed to duplicate product', { id: toastId });
            setIsProcessing(false);
        }
    };

    const handleToggleActive = async (product) => {
        if (isProcessing) return;
        setIsProcessing(true);
        const isCurrentlyActive = product.status === 'ACTIVE';
        const newState = !isCurrentlyActive;
        const actionText = newState ? 'Activating' : 'Deactivating';
        const toastId = toast.loading(`${actionText}...`, `${product.name} will be ${newState ? 'visible' : 'hidden'}`);

        try {
            // Explicitly set to a state rather than just toggling if we have a target
            // But since backend only has toggleActive, we check state here first
            // To be more robust, we should ideally have setStatus(id, status)
            await axios.patch(`/products/${product.id}/toggle-active`);
            toast.success('Updated', `Product is now ${newState ? 'Active' : 'Hidden'}`, { id: toastId });
            fetchProducts(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error('Update Failed', 'Failed to update product status', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!productToDelete || isProcessing) return;

        setIsProcessing(true);
        const toastId = toast.loading('Deleting...', `Removing ${productToDelete.name}`);

        // Safety timeout
        const safetyTimeout = setTimeout(() => setIsProcessing(false), 15000);

        try {
            await axios.delete(`/products/${productToDelete.id}`);
            clearTimeout(safetyTimeout);
            toast.success('Deleted', 'Product deleted successfully', { id: toastId });
            fetchProducts(); // Refresh list
            setShowDeleteModal(false);
            setProductToDelete(null);
            setIsProcessing(false);
        } catch (err) {
            clearTimeout(safetyTimeout);
            console.error(err);
            
            // Handle foreign key constraint error specifically
            const errorStatus = err.response?.status;
            const errorMsg = (err.response?.data?.message || err.response?.data || err.message || "").toLowerCase();
            
            if (errorStatus === 409 || errorStatus === 500 || errorMsg.includes("foreign key") || errorMsg.includes("referenced")) {
                toast.remove(toastId); // Remove the deleting toast
                setShowDeleteModal(false); // Close the original delete modal
                setShowHideSuggestion(true); // Open the new suggestion modal
            } else {
                toast.error('Delete Failed', 'An unexpected error occurred', { id: toastId });
            }
            setIsProcessing(false);
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
        return 'https://placehold.co/48x48?text=No+Image';
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
                                                <th title="Total stock of all size/color variants">Total Stock</th>
                                                <th>Status</th>
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
                                                                    onError={(e) => { 
                                                                        if (!e.target.dataset.errorCalled) {
                                                                            e.target.dataset.errorCalled = 'true';
                                                                            e.target.src = 'https://placehold.co/48x48?text=No+Image';
                                                                        } else {
                                                                            e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                                        }
                                                                    }}
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
                                                                    {stock} items
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`${styles.stockBadge} ${product.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge}`}>
                                                                    {product.status === 'ACTIVE' ? 'Active' : 'Hidden'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className={styles.actions}>
                                                                    <button 
                                                                        className={`${styles.actionButton} ${styles.toggleBtn}`} 
                                                                        title={product.status === 'ACTIVE' ? "Hide Product" : "Show Product"}
                                                                        onClick={() => handleToggleActive(product)}
                                                                    >
                                                                        {product.status === 'ACTIVE' ? <BiShow size={18} /> : <BiHide size={18} />}
                                                                    </button>
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

                                {/* Numerical Pagination */}
                                {totalPages > 1 && (
                                    <div className={styles.pagination}>
                                        <button
                                            className={styles.pageArrow}
                                            disabled={page === 0}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            <BiChevronLeft />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => {
                                            // Simple logic to show current, first, last, and neighbors
                                            if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                                                return (
                                                    <button
                                                        key={i}
                                                        className={`${styles.pageNumber} ${page === i ? styles.pageActive : ''}`}
                                                        onClick={() => setPage(i)}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                );
                                            } else if (i === page - 2 || i === page + 2) {
                                                return <span key={i} className={styles.pageDots}>...</span>;
                                            }
                                            return null;
                                        })}

                                        <button
                                            className={styles.pageArrow}
                                            disabled={page >= totalPages - 1}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            <BiChevronRight />
                                        </button>

                                        <div className={styles.totalInfo}>
                                            Total: {totalElements} products
                                        </div>
                                    </div>
                                )}
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

            {/* Hide Suggestion Modal */}
            {showHideSuggestion && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Delete Restricted</h3>
                        <p>
                            We cannot permanently delete <strong>{productToDelete?.name}</strong> because it is part of past customer orders. To keep your sales records accurate, this product must remain in the system.
                            <br /><br />
                            {productToDelete?.status === 'HIDDEN'
                                ? "It's already HIDDEN, so it won't be visible to your customers."
                                : "Would you like to HIDE it from your store instead? Customers won't see it, but your order history will stay intact."}
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setShowHideSuggestion(false);
                                    setProductToDelete(null);
                                }}
                            >
                                {productToDelete?.status === 'HIDDEN' ? 'Close' : 'Not Now'}
                            </button>
                            {productToDelete?.status !== 'HIDDEN' && (
                                <button 
                                    className={styles.confirmBtn} 
                                    style={{ backgroundColor: '#FF8800' }}
                                    onClick={() => {
                                        handleToggleActive(productToDelete);
                                        setShowHideSuggestion(false);
                                        setProductToDelete(null);
                                    }}
                                >
                                    Yes, Hide Product
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
