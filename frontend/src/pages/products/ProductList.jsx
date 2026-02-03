import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BiChevronDown, BiChevronUp, BiChevronRight, BiShoppingBag, BiSearch, BiHeart, BiGridAlt, BiListUl, BiCheck } from 'react-icons/bi';
import styles from './ProductList.module.css';
import { products, productCategories, colors, sizes, services } from '../../data/mockData';

function ProductList() {
    const [priceRange, setPriceRange] = useState(500);
    const [sortOption, setSortOption] = useState('latest');
    const [selectedColors, setSelectedColors] = useState([]);

    // State for collapsible sections (true = collapsed)
    const [collapsed, setCollapsed] = useState({
        categories: false,
        price: false,
        color: false,
        size: false
    });

    const toggleSection = (section) => {
        setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleColor = (color) => {
        setSelectedColors(prev =>
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
    };

    // Sorting Logic
    const getSortedProducts = () => {
        let sorted = [...products];
        if (sortOption === 'price-low-high') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-high-low') {
            sorted.sort((a, b) => b.price - a.price);
        }
        // 'latest' default (as is in mockData)
        return sorted;
    };

    const displayedProducts = getSortedProducts();

    return (
        <div className={styles.shopContainer}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                Home &gt; <span>Products</span>
            </div>

            <div className={styles.contentWrapper}>
                {/* --- Sidebar Filter --- */}
                <aside className={styles.sidebar}>

                    {/* Categories */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle} onClick={() => toggleSection('categories')}>
                            Product Categories {collapsed.categories ? <BiChevronRight /> : <BiChevronDown />}
                        </div>
                        {!collapsed.categories && (
                            <ul className={styles.filterList}>
                                {productCategories.map((cat, idx) => (
                                    <li key={idx} className={styles.filterItem}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input type="checkbox" /> {cat}
                                        </label>
                                        <span style={{ fontSize: '1.2rem' }}>+</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Price */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle} onClick={() => toggleSection('price')}>
                            Filter by Price {collapsed.price ? <BiChevronRight /> : <BiChevronDown />}
                        </div>
                        {!collapsed.price && (
                            <>
                                <input
                                    type="range"
                                    min="0"
                                    max="2000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className={styles.priceRange}
                                />
                                <div className={styles.priceLabel}>Price: $0 - ${priceRange}</div>
                            </>
                        )}
                    </div>

                    {/* Color */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle} onClick={() => toggleSection('color')}>
                            Filter by Color {collapsed.color ? <BiChevronRight /> : <BiChevronDown />}
                        </div>
                        {!collapsed.color && (
                            <div className={styles.colorList}>
                                {colors.map((col, idx) => {
                                    const isSelected = selectedColors.includes(col.name);
                                    return (
                                        <div key={idx} className={styles.colorItem} onClick={() => toggleColor(col.name)}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    className={`${styles.colorSwatch} ${isSelected ? styles.selectedSwatch : ''}`}
                                                    style={{ backgroundColor: col.hex }}
                                                >
                                                    {isSelected && <BiCheck color={col.name === 'White' || col.name === 'Yellow' ? '#000' : '#fff'} />}
                                                </span>
                                                {col.name}
                                            </div>
                                            <span>({col.count})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Size */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle} onClick={() => toggleSection('size')}>
                            Filter by Size {collapsed.size ? <BiChevronRight /> : <BiChevronDown />}
                        </div>
                        {!collapsed.size && (
                            <ul className={styles.filterList}>
                                {sizes.map((size, idx) => (
                                    <li key={idx} className={styles.sizeItem}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input type="checkbox" /> {size.name}
                                        </label>
                                        <span>({size.count})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </aside>

                {/* --- Main Content --- */}
                <main className={styles.mainContent}>

                    {/* Header: Sorting & View */}
                    <div className={styles.shopHeader}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <BiGridAlt size={24} />
                            <BiListUl size={24} color="#ccc" />
                            <span className={styles.resultsCount}>Showing 1–{displayedProducts.length} of 72 results</span>
                        </div>
                        <div className={styles.sortWrapper}>
                            Sort by
                            <select
                                className={styles.sortSelect}
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="latest">Latest</option>
                                <option value="price-low-high">Price: Low to High</option>
                                <option value="price-high-low">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className={styles.productGrid}>
                        {displayedProducts.map(product => (
                            <div key={product.id} className={styles.productCard}>
                                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className={styles.productImgWrapper}>
                                        <img src={product.image} alt={product.name} className={styles.productImg} />
                                        <div className={styles.hoverActions}>
                                            <button className={styles.actionBtn}><BiHeart /></button>
                                            <button className={styles.actionBtn}><BiSearch /></button>
                                            <button className={styles.actionBtn}><BiShoppingBag /></button>
                                        </div>
                                    </div>
                                    <div className={styles.productInfo}>
                                        <h4>{product.brand}</h4>
                                        <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>{product.name}</p>
                                        <div>
                                            <span className={styles.price}>${product.price.toFixed(2)}</span>
                                            <span className={styles.oldPrice}>${product.originalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <button className={styles.pageBtn} disabled>&lt;</button>
                        <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                        <button className={styles.pageBtn}>2</button>
                        <button className={styles.pageBtn}>3</button>
                        <button className={styles.pageBtn}>...</button>
                        <button className={styles.pageBtn}>10</button>
                        <button className={styles.pageBtn}>&gt;</button>
                    </div>

                </main>
            </div>

            {/* --- Services Section --- */}
            <section className={styles.featuresSection}>
                {services.map(service => (
                    <div key={service.id} className={styles.featureItem}>
                        <service.icon className={styles.featureIcon} />
                        <div>
                            <h4 className={styles.featureTitle}>{service.title}</h4>
                            <p className={styles.featureDesc}>{service.desc}</p>
                        </div>
                    </div>
                ))}
            </section>

        </div>
    );
}

export default ProductList;
