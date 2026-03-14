import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import HeroSection from '../components/home/HeroSection';
import CategoryBanners from '../components/home/CategoryBanners';
import ProductSection from '../components/home/ProductSection';
import styles from './Home.module.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/products');
        const data = Array.isArray(response.data) ? response.data : response.data.content;
        if (data) setProducts(data);
        setError(null);
      } catch (err) {
        setError("Unable to load latest products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    viewport: { once: false, amount: 0.2 }
  };

  const itemFadeIn = {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <div className={styles.homeContainer}>
      {/* 1. High-impact Hero Banner */}
      <HeroSection />

      {/* 2. Collection Category Banners */}
      <motion.div {...fadeInUp}>
        <CategoryBanners />
      </motion.div>

      {error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* 3. Main Product Section with Category Tabs */}
          <motion.div {...fadeInUp}>
            <ProductSection 
              title="Product News" 
              products={products} 
              loading={loading} 
            />
          </motion.div>

          {/* 4. Luxury Branding Section */}
          <motion.section 
            className={styles.brandStory}
            {...fadeInUp}
          >
            <div className={styles.storyContent}>
              <span className={styles.storyLabel}>IVY MODA STORIES</span>
              <h2 className={styles.storyTitle}>VẺ ĐẸP HIỆN ĐẠI</h2>
              <p className={styles.storyDesc}>
                Khám phá phong cách sống và cảm hứng thời trang dẫn đầu xu hướng 
                từ các bộ sưu tập mang đậm dấu ấn sáng tạo và tinh thần đương đại.
              </p>
              <button className={styles.storyBtn}>XEM THÊM</button>
            </div>
            <motion.div 
              className={styles.storyGallery}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" alt="Story 1" />
              <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=600&q=80" alt="Story 2" />
            </motion.div>
          </motion.section>

          {/* 5. Instagram / Social Feed */}
          <section className={styles.socialSection}>
            <motion.h2 
              className={styles.socialTitle}
              {...fadeInUp}
            >
              #IVYmoda ON INSTAGRAM
            </motion.h2>
            <motion.div 
              className={styles.socialGrid}
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: false }}
            >
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div 
                  key={i} 
                  className={styles.socialItem}
                  variants={itemFadeIn}
                >
                  <img src={`https://images.unsplash.com/photo-1596483562305-64c39f139580?w=300&q=80`} alt="Insta" />
                </motion.div>
              ))}
            </motion.div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
