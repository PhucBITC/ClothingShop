import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiInstagram, FiHeart } from 'react-icons/fi';
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
              <span className={styles.storyLabel}>L&P STORIES</span>
              <h2 className={styles.storyTitle}>MODERN ELEGANCE</h2>
              <p className={styles.storyDesc}>
                Discover a lifestyle and fashion inspiration that leads the trends —
                from collections bearing the hallmark of creativity and a contemporary spirit.
              </p>
              <Link to="/story" className={styles.storyBtn}>DISCOVER MORE</Link>
            </div>
            <motion.div 
              className={styles.storyGallery}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className={styles.galleryMain}>
                <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80" alt="Fashion editorial" />
              </div>
              <div className={styles.galleryStack}>
                <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80" alt="Behind the scenes" />
                <img src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80" alt="Studio work" />
              </div>
            </motion.div>
          </motion.section>

          {/* 5. Instagram / Social Feed */}
          <section className={styles.socialSection}>
            <motion.div className={styles.socialHeader} {...fadeInUp}>
              <FiInstagram className={styles.socialIcon} />
              <h2 className={styles.socialTitle}>
                @LighterPrincess
              </h2>
              <p className={styles.socialSubtitle}>Follow us for daily fashion inspiration</p>
            </motion.div>
            <motion.div 
              className={styles.socialGrid}
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: false }}
            >
              {[
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
                'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80',
                'https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=400&q=80',
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80'
              ].map((src, i) => (
                <motion.a 
                  key={i}
                  href="https://instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialItem}
                  variants={itemFadeIn}
                  whileHover={{ scale: 1.03 }}
                >
                  <img src={src} alt={`Instagram post ${i + 1}`} />
                  <div className={styles.socialOverlay}>
                    <FiHeart />
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
