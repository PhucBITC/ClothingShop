import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import styles from './ProductSection.module.css';

const ProductSection = ({ title, products, loading }) => {
    const [activeTab, setActiveTab] = useState('ALL');

    const tabs = [
        { id: 'ALL', label: 'All' },
        { id: 'WOMEN', label: 'Women' },
        { id: 'MEN', label: 'Men' },
        { id: 'KIDS', label: 'Kids' },
        { id: 'FOOTWEAR', label: 'Footwear' },
        { id: 'ACCESSORIES', label: 'Accessories' },
        { id: 'TRADITIONAL_WEAR', label: 'Traditional Wear' },
        { id: 'NEW_ARRIVALS', label: 'New Arrivals' }
    ];

    const filteredProducts = activeTab === 'ALL'
        ? products
        : products.filter(p => {
            const catName = p.category?.name?.toUpperCase() || '';
            const catType = p.category?.categoryType?.toUpperCase() || '';
            return catName === activeTab || catType === activeTab;
        });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4 }
        }
    };


    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                <div className={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.productGrid}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <motion.div
                                key={`skeleton-${i}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SkeletonCard />
                            </motion.div>
                        ))
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.slice(0, 10).map((product) => (
                            <motion.div
                                key={`p-${product.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            key="empty-state"
                            className={styles.noProducts}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <p>There are currently no products in this category.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={styles.viewAllWrapper}>
                <button className={styles.viewAllBtn}>XEM TẤT CẢ</button>
            </div>
        </section>
    );
};

export default ProductSection;
