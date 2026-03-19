import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import styles from './HeroSection.module.css';
import api from '../../api/axios';

const HeroSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                // Priority 1: Try fetching products with the 'HERO' tag
                const heroTagResponse = await api.get('/products/search', {
                    params: { tag: 'HERO', size: 3, sortBy: 'createdAt', direction: 'desc', status: 'ACTIVE' }
                });

                let results = heroTagResponse.data?.content || [];

                // Priority 2: Fallback to the latest 3 products if no HERO products are found
                if (results.length === 0) {
                    const latestResponse = await api.get('/products/search', {
                        params: { size: 3, sortBy: 'createdAt', direction: 'desc', status: 'ACTIVE' }
                    });
                    results = latestResponse.data?.content || [];
                }

                if (results.length > 0) {
                    const dynamicSlides = results.map(product => ({
                        id: product.id,
                        image: product.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80",
                        title: product.name.toUpperCase(),
                        subtitle: product.category?.name?.toUpperCase() || "NEW COLLECTION",
                        offer: product.basePrice ? `FROM $${product.basePrice.toLocaleString()}` : "EXCLUSIVE DEAL",
                        link: `/products/${product.id}`
                    }));
                    setSlides(dynamicSlides);
                }
            } catch (error) {
                console.error("Error fetching hero products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroData();
    }, []);

    const nextSlide = () => {
        if (slides.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        if (slides.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    if (loading) return <div className={styles.loading}>Loading Hero...</div>;
    if (slides.length === 0) return null;

    return (
        <section className={styles.heroContainer}>
            <div className={styles.sliderWrapper}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slides[currentIndex].id}
                        className={styles.bannerItem}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link to={slides[currentIndex].link} className={styles.slideLink}>
                            <img src={slides[currentIndex].image} alt="Hero Banner" className={styles.heroImage} />

                            <div className={styles.overlay}>
                                <motion.div
                                    className={styles.content}
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: {
                                                staggerChildren: 0.2,
                                                delayChildren: 0.3
                                            }
                                        }
                                    }}
                                >
                                    <motion.h4 
                                        className={styles.subtitle}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                                        }}
                                    >
                                        {slides[currentIndex].subtitle}
                                    </motion.h4>
                                    <motion.h1 
                                        className={styles.title}
                                        variants={{
                                            hidden: { opacity: 0, y: 30 },
                                            visible: { opacity: 1, y: 0, transition: { duration: 1 } }
                                        }}
                                    >
                                        {slides[currentIndex].title}
                                    </motion.h1>
                                    <motion.h2 
                                        className={styles.offer}
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.8 },
                                            visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } }
                                        }}
                                    >
                                        {slides[currentIndex].offer}
                                    </motion.h2>
                                    <motion.div 
                                        className={styles.ctaBtn}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                    >
                                       Discover Now
                                    </motion.div>
                                </motion.div>
                            </div>
                        </Link>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button className={`${styles.arrow} ${styles.leftArrow}`} onClick={prevSlide}>
                    <BiChevronLeft size={40} />
                </button>
                <button className={`${styles.arrow} ${styles.rightArrow}`} onClick={nextSlide}>
                    <BiChevronRight size={40} />
                </button>

                {/* Indicators */}
                <div className={styles.indicators}>
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`${styles.dot} ${currentIndex === index ? styles.activeDot : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        ></span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
