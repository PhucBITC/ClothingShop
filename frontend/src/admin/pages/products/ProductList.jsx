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

const CATEGORY_TYPES = [
    'MEN', 'WOMEN', 'KIDS', 'FOOTWEAR', 'ACCESSORIES', 'TRADITIONAL_WEAR', 'NEW_ARRIVALS'
];

const ProductList = () => {
    const [error, setError] = useState(null);
    const toast = useToast();

    // Filter State
    const [filters, setFilters] = useState({
        keyword: '',
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        tag: ''
    });

    const [categories, setCategories] = useState([]);

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showHideSuggestion, setShowHideSuggestion] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Grouping State
    const [expandedGroups, setExpandedGroups] = useState(new Set([CATEGORY_TYPES[0]]));
    const [groupData, setGroupData] = useState({}); // { TYPE: { products: [], page: 0, totalPages: 0, totalElements: 0, loading: false } }

    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        CATEGORY_TYPES.forEach(type => {
            if (expandedGroups.has(type)) {
                fetchProductsByType(type);
            }
        });
    }, [expandedGroups, filters]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            if (Array.isArray(res.data)) setCategories(res.data);
        } catch (e) {
            console.error("Failed to load categories");
        }
    };

    const fetchProductsByType = async (type, pageNum = 0) => {
        try {
            setGroupData(prev => ({
                ...prev,
                [type]: { ...prev[type], loading: true }
            }));

            const params = {
                page: pageNum,
                size: 5,
                keyword: filters.keyword,
                categoryId: filters.categoryId,
                categoryType: type,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                tag: filters.tag
            };

            // Remove empty params
            Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

            const response = await axios.get('/products/search', { params });

            setGroupData(prev => ({
                ...prev,
                [type]: {
                    products: response.data?.content || [],
                    page: pageNum,
                    totalPages: response.data?.totalPages || 0,
                    totalElements: response.data?.totalElements || 0,
                    loading: false
                }
            }));
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${type} products:`, err);
            setGroupData(prev => ({
                ...prev,
                [type]: { ...prev[type], loading: false }
            }));
        }
    };

    const toggleGroup = (type) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(type)) {
            newExpanded.delete(type);
        } else {
            newExpanded.add(type);
        }
        setExpandedGroups(newExpanded);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        // Refresh all expanded groups
        expandedGroups.forEach(type => fetchProductsByType(type, 0));
    };

    const handleResetFilters = () => {
        setFilters({
            keyword: '',
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            tag: ''
        });
        // We don't need setPage(0) anymore as pagination is per-group
        setTimeout(() => {
            expandedGroups.forEach(type => fetchProductsByType(type, 0));
        }, 100);
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
            // Refresh only the affected group
            const type = product.category?.categoryType;
            if (type) fetchProductsByType(type, groupData[type]?.page || 0);
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
            const type = product.category?.categoryType;
            if (type) fetchProductsByType(type, groupData[type]?.page || 0);
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
            const type = productToDelete.category?.categoryType;
            if (type) fetchProductsByType(type, groupData[type]?.page || 0);
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
                    {CATEGORY_TYPES.map(type => {
                        const data = { products: [], loading: false, totalElements: 0, ...groupData[type] };
                        const isExpanded = expandedGroups.has(type);

                        return (
                            <div key={type} className={styles.categoryGroup}>
                                <div className={styles.groupHeader} onClick={() => toggleGroup(type)}>
                                    <div className={styles.groupTitleInfo}>
                                        <span className={styles.groupToggleIcon}>{isExpanded ? '−' : '+'}</span>
                                        <h3 className={styles.groupTitleName}>{type.replace('_', ' ')}</h3>
                                        <span className={styles.groupCountBadge}>{data.totalElements} Products</span>
                                    </div>
                                    <div className={styles.groupStatus}>
                                        {data.loading && <span className={styles.groupLoadingMini}>Loading...</span>}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className={styles.groupBody}>
                                        <div className={styles.tableContainer}>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Category</th>
                                                        <th>Price</th>
                                                        <th>Total Stock</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.products.length > 0 ? (
                                                        data.products.map((product) => {
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
                                                                                }
                                                                            }}
                                                                        />
                                                                        <div>
                                                                            <div className={styles.productName}>{product.name}</div>
                                                                            {product.slug && <small className={styles.productSlug}>{product.slug}</small>}
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
                                                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                                                {data.loading ? 'Updating...' : 'No products found in this category.'}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination for this specific type */}
                                        {data.totalPages > 1 && (
                                            <div className={styles.pagination}>
                                                <button
                                                    className={styles.pageArrow}
                                                    disabled={data.page === 0}
                                                    onClick={() => fetchProductsByType(type, data.page - 1)}
                                                >
                                                    <BiChevronLeft />
                                                </button>

                                                {Array.from({ length: data.totalPages }, (_, i) => {
                                                    if (i === 0 || i === data.totalPages - 1 || (i >= data.page - 1 && i <= data.page + 1)) {
                                                        return (
                                                            <button
                                                                key={i}
                                                                className={`${styles.pageNumber} ${data.page === i ? styles.pageActive : ''}`}
                                                                onClick={() => fetchProductsByType(type, i)}
                                                            >
                                                                {i + 1}
                                                            </button>
                                                        );
                                                    } else if (i === data.page - 2 || i === data.page + 2) {
                                                        return <span key={i} className={styles.pageDots}>...</span>;
                                                    }
                                                    return null;
                                                })}

                                                <button
                                                    className={styles.pageArrow}
                                                    disabled={data.page >= data.totalPages - 1}
                                                    onClick={() => fetchProductsByType(type, data.page + 1)}
                                                >
                                                    <BiChevronRight />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
