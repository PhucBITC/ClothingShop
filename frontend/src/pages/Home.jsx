import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiInstagram, FiHeart } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext';
import axios from '../api/axios';
import HeroSection from '../components/home/HeroSection';
import CategoryBanners from '../components/home/CategoryBanners';
import ProductSection from '../components/home/ProductSection';
import styles from './Home.module.css';

function Home() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('ALL');
  const [products, setProducts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        const params = {
          status: 'ACTIVE',
          size: activeTab === 'ALL' ? 15 : 10,
        };

        if (activeTab !== 'ALL') {
          params.categoryType = activeTab;
        }

        // Fetch products and blog posts in parallel
        const [prodRes, blogRes] = await Promise.all([
          axios.get('/products/search', { params }),
          axios.get('/blog-posts/latest', { params: { limit: 3 } })
        ]);

        const prodData = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.content;
        if (prodData) setProducts(prodData);
        
        if (blogRes.data) setBlogPosts(blogRes.data);

        setError(null);
      } catch (err) {
        setError("Unable to load homepage data.");
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [activeTab]);


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
              activeTab={activeTab}
              onTabChange={setActiveTab}
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

          {/* 5. Journal / Blog Section */}
          <section className={styles.journalSection}>
            <motion.div className={styles.journalHeader} {...fadeInUp}>
              <span className={styles.journalLabel}>OUR STORIES</span>
              <h2 className={styles.journalTitle}>L&P JOURNAL</h2>
              <p className={styles.journalSubtitle}>Discover the latest trends, styling tips, and brand stories.</p>
            </motion.div>
            
            <motion.div 
              className={styles.journalGrid}
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: false }}
            >
              {blogPosts.map((post, i) => (
                <motion.div 
                  key={post.id}
                  className={styles.journalCard}
                  variants={itemFadeIn}
                >
                  <Link to={`/blog/${post.slug}`} className={styles.journalImageWrapper}>
                    <img src={post.coverImage} alt={post.title} />
                    <span className={styles.journalCategory}>{post.category}</span>
                  </Link>
                  <div className={styles.journalInfo}>
                    <span className={styles.journalDate}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3 className={styles.journalPostTitle}>{post.title}</h3>
                    <p className={styles.journalExcerpt}>{post.excerpt}</p>
                    <Link to={`/blog/${post.slug}`} className={styles.readMore}>READ MORE</Link>
                  </div>
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
