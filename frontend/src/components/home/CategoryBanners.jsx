import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './CategoryBanners.module.css';

const CategoryBanners = () => {
    const categories = [
        {
            id: 'WOMEN',
            title: "WOMEN'S COLLECTION",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80",
            link: "/products?category=WOMEN"
        },
        {
            id: 'MEN',
            title: "MEN'S COLLECTION",
            image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1000&q=80",
            link: "/products?category=MEN"
        },
        {
            id: 'KIDS',
            title: "KIDS' COLLECTION",
            image: "https://images.unsplash.com/photo-1519233073524-829b378cc6a1?w=1000&q=80",
            link: "/products?category=KIDS"
        },
        {
            id: 'FOOTWEAR',
            title: "PREMIUM FOOTWEAR",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
            link: "/products?category=FOOTWEAR"
        },
        {
            id: 'ACCESSORIES',
            title: "LUXURY ACCESSORIES",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80",
            link: "/products?category=ACCESSORIES"
        },
        {
            id: 'NEW_ARRIVALS',
            title: "NEW ARRIVALS 2024",
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=1000&q=80",
            link: "/products?category=NEW_ARRIVALS"
        }
    ];

    // Show 2 items at a time
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 2) % categories.length);
        }, 4000); // Transitions every 4 seconds

        return () => clearInterval(timer);
    }, [categories.length]);

    const displayCategories = [
        categories[currentIndex],
        categories[(currentIndex + 1) % categories.length]
    ];

    return (
        <section className={styles.container}>
            <div className={styles.sliderWrapper}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        className={styles.sliderGrid}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration:0.4, ease: "easeInOut" }}
                    >
                        {displayCategories.map((cat) => (
                            <div key={cat.id} className={styles.banner}>
                                <Link to={cat.link} className={styles.bannerLink}>
                                    <img src={cat.image} alt={cat.title} className={styles.image} />
                                    <div className={styles.overlay}>
                                        <h3 className={styles.title}>{cat.title}</h3>
                                        <span className={styles.linkText}>XEM NGAY</span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className={styles.progressDots}>
                {Array.from({ length: categories.length / 2 }).map((_, i) => (
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
