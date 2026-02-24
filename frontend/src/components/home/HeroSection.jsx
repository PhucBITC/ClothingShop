import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import styles from './HeroSection.module.css';

const HeroSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80",
            title: "DEEP IN ROUGE",
            subtitle: "FALL WINTER 2025 COLLECTION",
            offer: "SALE UP TO 50%",
            link: "/products"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?w=1600&q=80",
            title: "SPRING BLOOM",
            subtitle: "SPRING SUMMER 2024",
            offer: "NEW ARRIVALS",
            link: "/products"
        }
    ];

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

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
                                    initial={{ x: 30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                >
                                    <h4 className={styles.subtitle}>{slides[currentIndex].subtitle}</h4>
                                    <h1 className={styles.title}>{slides[currentIndex].title}</h1>
                                    <h2 className={styles.offer}>{slides[currentIndex].offer}</h2>
                                    <div className={styles.ctaBtn}>KHÁM PHÁ NGAY</div>
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
