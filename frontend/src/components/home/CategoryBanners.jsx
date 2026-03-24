import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './CategoryBanners.module.css';

import api from '../../api/axios';

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=Product+Image";

const ORIGINAL_CATEGORIES = [
    { id: 'WOMEN', title: "WOMEN'S COLLECTION", image: PLACEHOLDER_IMAGE, link: "/products?category=WOMEN", keywords: ['women', 'nữ', 'váy', 'đầm', 'dress', 'gown', 'top', 'shirt'] },
    { id: 'MEN', title: "MEN'S COLLECTION", image: PLACEHOLDER_IMAGE, link: "/products?category=MEN", keywords: ['men', 'nam', 'shirt', 'polo', 'trousers', 'pants', 'jackets', 'coats', 'suits', 'blazers'] },
    { id: 'KIDS', title: "KIDS' COLLECTION", image: PLACEHOLDER_IMAGE, link: "/products?category=KIDS", keywords: ['kids', 'trẻ em', 'bé', 'casual', 'wear', 'bottoms'] },
    { id: 'FOOTWEAR', title: "PREMIUM FOOTWEAR", image: PLACEHOLDER_IMAGE, link: "/products?category=FOOTWEAR", keywords: ['footwear', 'giày', 'shoes', 'sneakers'] },
    { id: 'ACCESSORIES', title: "LUXURY ACCESSORIES", image: PLACEHOLDER_IMAGE, link: "/products?category=ACCESSORIES", keywords: ['accessories', 'phụ kiện', 'túi', 'ví', 'bag', 'wallet'] },
    { id: 'NEW_ARRIVALS', title: "NEW ARRIVALS 2024", image: PLACEHOLDER_IMAGE, link: "/products?category=NEW_ARRIVALS", keywords: ['new', 'mới'] },
    { id: 'BEST_SELLERS', title: "BEST SELLERS", image: PLACEHOLDER_IMAGE, link: "/products", keywords: ['best', 'bán chạy', 'hot'] }
];

const CategoryBanners = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [categories, setCategories] = useState(ORIGINAL_CATEGORIES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/banners');
                const dynamicData = response.data || [];
                
                if (dynamicData.length > 0) {
                    const mappedDynamic = dynamicData.map(cat => ({
                        dbId: cat.id,
                        name: cat.name,
                        type: cat.categoryType, // New field from backend
                        image: cat.imageUrl,
                        link: `/products?category=${cat.id}`
                    }));

                    // Smart Match: Try to pair dynamic categories with original slots
                    const result = ORIGINAL_CATEGORIES.map(slot => {
                        // 1. Try matching by categoryType (e.g., 'MEN' matches slot.id 'MEN')
                        let match = mappedDynamic.find(d => 
                            !d.used && d.type === slot.id
                        );

                        // 2. Fallback: Try matching by keywords in the category name
                        if (!match) {
                            match = mappedDynamic.find(d => 
                                !d.used && slot.keywords.some(k => d.name.toLowerCase().includes(k))
                            );
                        }

                        if (match) {
                            match.used = true; // Mark as used so we don't repeat it in other slots
                            return {
                                ...slot,
                                id: match.dbId,
                                title: match.name,
                                image: match.image,
                                link: match.link
                            };
                        }
                        return slot; // Keep original if no match
                    });

                    setCategories(result);
                }
            } catch (error) {
                console.error("Error fetching category banners:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            const timer = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 2) % categories.length);
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [categories.length]);

    const displayCategories = [
        categories[currentIndex % categories.length],
        categories[(currentIndex + 1) % categories.length]
    ];

    const handleImageError = (e) => {
        e.target.src = PLACEHOLDER_IMAGE;
    };

    return (
        <section className={styles.container}>
            <div className={styles.sliderWrapper}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        className={styles.sliderGrid}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {displayCategories.map((cat) => (
                            <div key={cat.dbId || cat.id} className={styles.banner}>
                                <Link to={cat.link} className={styles.bannerLink}>
                                    <img 
                                        src={cat.image} 
                                        alt={cat.title || "Category Collection"} 
                                        className={styles.image} 
                                        onError={handleImageError}
                                    />
                                    <div className={styles.overlay}>
                                        <h3 className={styles.title}>{cat.title}</h3>
                                        <span className={styles.linkText}>VIEW NOW</span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className={styles.progressDots}>
                {Array.from({ length: Math.ceil(categories.length / 2) }).map((_, i) => (
                    <span
                        key={i}
                        className={`${styles.dot} ${Math.floor(currentIndex / 2) === i ? styles.activeDot : ''}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default CategoryBanners;
