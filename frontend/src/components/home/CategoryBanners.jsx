import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './CategoryBanners.module.css';

import api from '../../api/axios';

const ORIGINAL_CATEGORIES = [
    { id: 'WOMEN', title: "WOMEN'S COLLECTION", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80", link: "/products?category=WOMEN", keywords: ['women', 'nữ', 'váy', 'đầm'] },
    { id: 'MEN', title: "MEN'S COLLECTION", image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1000&q=80", link: "/products?category=MEN", keywords: ['men', 'nam'] },
    { id: 'KIDS', title: "KIDS' COLLECTION", image: "https://images.unsplash.com/photo-1519233073524-829b378cc6a1?w=1000&q=80", link: "/products?category=KIDS", keywords: ['kids', 'trẻ em', 'bé'] },
    { id: 'FOOTWEAR', title: "PREMIUM FOOTWEAR", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80", link: "/products?category=FOOTWEAR", keywords: ['footwear', 'giày', 'shoes'] },
    { id: 'ACCESSORIES', title: "LUXURY ACCESSORIES", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80", link: "/products?category=ACCESSORIES", keywords: ['accessories', 'phụ kiện', 'túi', 'ví'] },
    { id: 'NEW_ARRIVALS', title: "NEW ARRIVALS 2024", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=1000&q=80", link: "/products?category=NEW_ARRIVALS", keywords: ['new', 'mới'] },
    { id: 'BEST_SELLERS', title: "BEST SELLERS", image: "https://images.unsplash.com/photo-1445205170230-053b830c6050?w=1000&q=80", link: "/products", keywords: ['best', 'bán chạy'] }
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
                        image: cat.imageUrl,
                        link: `/products?category=${cat.id}`
                    }));

                    // Smart Match: Try to pair dynamic categories with original slots
                    const result = ORIGINAL_CATEGORIES.map(slot => {
                        const match = mappedDynamic.find(d => 
                            slot.keywords.some(k => d.name.toLowerCase().includes(k))
                        );

                        if (match) {
                            // Mark as used so we don't repeat it
                            match.used = true;
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

                    // If there are dynamic categories that DIDN'T match any slot, 
                    // we could replace the least important slots, but for now let's stick to matching.
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
        e.target.src = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=1000&q=80";
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
