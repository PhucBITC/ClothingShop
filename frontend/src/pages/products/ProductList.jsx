import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BiChevronDown, BiChevronRight, BiShoppingBag, BiSearch, BiHeart, BiGridAlt, BiListUl } from 'react-icons/bi';
import styles from './ProductList.module.css';
import { products, productCategories, colors, sizes } from '../../data/mockData';

function ProductList() {
    const [priceRange, setPriceRange] = useState(500);

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
                        <div className={styles.filterTitle}>
                            Product Categories <BiChevronDown />
                        </div>
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
                    </div>

                    {/* Price */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>
                            Filter by Price <BiChevronDown />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2000"
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className={styles.priceRange}
                        />
                        <div className={styles.priceLabel}>Price: $0 - ${priceRange}</div>
                    </div>

                    {/* Color */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>
                            Filter by Color <BiChevronDown />
                        </div>
                        <div className={styles.colorList}>
                            {colors.map((col, idx) => (
                                <div key={idx} className={styles.colorItem}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span className={styles.colorSwatch} style={{ backgroundColor: col.hex }}></span>
                                        {col.name}
                                    </div>
                                    <span>({col.count})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>
                            Filter by Size <BiChevronDown />
                        </div>
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
                    </div>

                </aside>

                {/* --- Main Content --- */}
                <main className={styles.mainContent}>

                    {/* Header: Sorting & View */}
                    <div className={styles.shopHeader}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <BiGridAlt size={24} />
                            <BiListUl size={24} color="#ccc" />
                            <span className={styles.resultsCount}>Showing 1–{products.length} of 72 results</span>
                        </div>
                        <div>
                            Sort by calm <BiChevronDown />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className={styles.productGrid}>
                        {products.map(product => (
                            <div key={product.id} className={styles.productCard}>
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
        </div>
    );
}

export default ProductList;
