import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import ProductCard from '../../components/home/ProductCard';
import SkeletonCard from '../../components/home/SkeletonCard';
import {
    BiChevronDown,
    BiChevronRight,
    BiGridAlt,
    BiListUl,
    BiFilter,
    BiReset,
    BiSearch,
    BiChevronLeft
} from 'react-icons/bi';
import styles from './ProductList.module.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ProductList() {
    const query = useQuery();
    const location = useLocation();

    // API State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter & Pagination State
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [filters, setFilters] = useState({
        keyword: query.get('search') || '',
        categoryId: query.get('category') || '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'createdAt',
        direction: 'desc',
        colors: [], // New
        sizes: []   // New
    });

    // Sidebar collapse state
    const [collapsed, setCollapsed] = useState({
        categories: false,
        price: false,
        color: false,
        size: false
    });

    const colors = [
        { name: 'Red', hex: '#FF0000', count: 10 },
        { name: 'Blue', hex: '#4169E1', count: 14 },
        { name: 'Orange', hex: '#FFA500', count: 8 },
        { name: 'Black', hex: '#000000', count: 9 },
        { name: 'Green', hex: '#32CD32', count: 4 },
        { name: 'Yellow', hex: '#FFFF00', count: 2 },
        { name: 'White', hex: '#FFFFFF', count: 12 },
        { name: 'Gray', hex: '#808080', count: 15 },
        { name: 'Pink', hex: '#FF69B4', count: 18 },
        { name: 'Purple', hex: '#800080', count: 20 },
        { name: 'Brown', hex: '#A52A2A', count: 22 },
        { name: 'Beige', hex: '#F5F5DC', count: 24 },
        { name: 'Navy', hex: '#000080', count: 26 },
        { name: 'Maroon', hex: '#800000', count: 28 },
        { name: 'Charcoal', hex: '#36454F', count: 30 },
    ];

    const sizes = [
        { label: 'XS', count: 4 },
        { label: 'S', count: 6 },
        { label: 'M', count: 20 },
        { label: 'L', count: 7 },
        { label: 'XL', count: 16 },
        { label: 'XXL', count: 10 },
        { label: '3XL', count: 2 },

    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const catId = query.get('category');
        const search = query.get('search');
        if (catId !== filters.categoryId || search !== filters.keyword) {
            setFilters(prev => ({
                ...prev,
                categoryId: catId || '',
                keyword: search || ''
            }));
            setPage(0);
        }
    }, [location.search]);

    useEffect(() => {
        fetchProducts();
    }, [page, filters.categoryId, filters.sortBy, filters.direction, filters.colors, filters.sizes]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            const catData = Array.isArray(res.data) ? res.data : [];
            setCategories(catData);

            const urlCat = query.get('category');
            if (urlCat && isNaN(urlCat)) {
                const found = catData.find(c => c.name.toUpperCase() === urlCat.toUpperCase());
                if (found) {
                    setFilters(prev => ({ ...prev, categoryId: found.id }));
                }
            }
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
                sortBy: filters.sortBy,
                direction: filters.direction,
                colors: filters.colors.join(','), // Assuming backend handles comma-separated lists or multiple params
                sizes: filters.sizes.join(',')
            };

            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            // Handle arrays specially for cleanup
            if (filters.colors.length === 0) delete params.colors;
            if (filters.sizes.length === 0) delete params.sizes;

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
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (e) => {
        const [sortBy, direction] = e.target.value.split(':');
        setFilters({ ...filters, sortBy, direction });
        setPage(0);
    };

    const toggleSection = (section) => {
        setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleApplyPriceFilter = () => {
        setPage(0);
        fetchProducts();
    };

    const toggleColor = (colorName) => {
        setFilters(prev => ({
            ...prev,
            colors: prev.colors.includes(colorName)
                ? prev.colors.filter(c => c !== colorName)
                : [...prev.colors, colorName]
        }));
        setPage(0);
    };

    const toggleSize = (sizeLabel) => {
        setFilters(prev => ({
            ...prev,
            sizes: prev.sizes.includes(sizeLabel)
                ? prev.sizes.filter(s => s !== sizeLabel)
                : [...prev.sizes, sizeLabel]
        }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            keyword: '',
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'createdAt',
            direction: 'desc',
            colors: [],
            sizes: []
        });
        setPage(0);
    };

    return (
        <div className={styles.shopContainer}>
            <div className={styles.breadcrumbs}>
                <Link to="/">Home</Link> <BiChevronRight /> <span>All Products</span>
            </div>

            <div className={styles.contentWrapper}>
                {/* Sidebar Filter */}
                <aside className={styles.sidebar}>
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle} onClick={() => toggleSection('categories')}>
                            <span>Product Categories</span> {collapsed.categories ? <BiChevronRight /> : <BiChevronDown />}
                        </div>
                        {!collapsed.categories && (
                            <ul className={styles.filterList}>
                                <li
                                    className={`${styles.filterItem} ${filters.categoryId === '' ? styles.activeFilter : ''}`}
                                    onClick={() => setFilters({ ...filters, categoryId: '' })}
                                >
                                    <input type="checkbox" checked={filters.categoryId === ''} readOnly />
                                    <span>All Products</span>
                                </li>
                                {categories.map((cat) => (
                                    <li
                                        key={cat.id}
                                        className={`${styles.filterItem} ${filters.categoryId == cat.id ? styles.activeFilter : ''}`}
                                        onClick={() => setFilters({ ...filters, categoryId: cat.id })}
                                    >
                                        <input type="checkbox" checked={filters.categoryId == cat.id} readOnly />
                                        <span>{cat.name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle} onClick={() => toggleSection('price')}>
                            <span>Filter by Price</span> {collapsed.price ? <BiChevronRight /> : <BiChevronDown />}
                        </div>
                        {!collapsed.price && (
                            <div className={styles.priceFilter}>
                                <div className={styles.priceInputs}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className={styles.priceInput}
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className={styles.priceInput}
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    />
                                </div>
                                <button className={styles.applyBtn} onClick={handleApplyPriceFilter}>Apply</button>
                            </div>
                        )}
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle} onClick={() => toggleSection('color')}>
                            <span>Filter by Color</span> {collapsed.color ? <BiChevronRight /> : <BiChevronDown />}
                        </div>
                        {!collapsed.color && (
                            <ul className={styles.colorList}>
                                {colors.map(color => (
                                    <li key={color.name} className={styles.colorItem} onClick={() => toggleColor(color.name)}>
                                        <div className={styles.colorLeft}>
                                            <span
                                                className={`${styles.colorSwatch} ${filters.colors.includes(color.name) ? styles.colorActive : ''}`}
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <span className={styles.colorName}>{color.name}</span>
                                        </div>
                                        <span className={styles.itemCount}>({color.count})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle} onClick={() => toggleSection('size')}>
                            <span>Filter by Size</span> {collapsed.size ? <BiChevronRight /> : <BiChevronDown />}
                        </div>
                        {!collapsed.size && (
                            <ul className={styles.sizeList}>
                                {sizes.map(size => (
                                    <li key={size.label} className={styles.sizeItem} onClick={() => toggleSize(size.label)}>
                                        <div className={styles.sizeLeft}>
                                            <input type="checkbox" checked={filters.sizes.includes(size.label)} readOnly />
                                            <span>{size.label}</span>
                                        </div>
                                        <span className={styles.itemCount}>({size.count})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button className={styles.resetBtn} onClick={handleResetFilters}>
                        <BiReset size={20} /> Reset All Filters
                    </button>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    <div className={styles.shopHeader}>
                        <div className={styles.headerLeft}>
                            <div className={styles.viewToggles}>
                                <BiGridAlt size={20} className={styles.activeView} />
                                <BiListUl size={20} />
                            </div>
                            <span className={styles.resultsCount}>
                                {loading ? 'Loading...' : `Showing 1–${products.length} of ${totalElements} results`}
                            </span>
                        </div>

                        <div className={styles.headerRight}>
                            <div className={styles.sortWrapper}>
                                <span>Sort by </span>
                                <select
                                    className={styles.sortSelect}
                                    onChange={handleSortChange}
                                    value={`${filters.sortBy}:${filters.direction}`}
                                >
                                    <option value="createdAt:desc">Latest</option>
                                    <option value="basePrice:asc">Price: Low to High</option>
                                    <option value="basePrice:desc">Price: High to Low</option>
                                    <option value="name:asc">A to Z</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className={styles.errorContainer}>{error}</div>
                    ) : (
                        <div className={styles.productGrid}>
                            {loading ? (
                                [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                            ) : products.length > 0 ? (
                                products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    <BiSearch size={50} />
                                    <p>No products found matching your filters.</p>
                                </div>
                            )}
                        </div>
                    )}

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
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default ProductList;
