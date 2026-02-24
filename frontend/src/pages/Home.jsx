import React, { useEffect, useState } from 'react';
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

  return (
    <div className={styles.homeContainer}>
      {/* 1. High-impact Hero Banner */}
      <HeroSection />

      {/* 2. Collection Category Banners (Ivy Moda style) */}
      <CategoryBanners />

      {error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* 3. Main Product Section with Category Tabs */}
          <ProductSection 
            title="Product News" 
            products={products} 
            loading={loading} 
          />

          {/* 4. Luxury Branding Section */}
          <section className={styles.brandStory}>
            <div className={styles.storyContent}>
              <span className={styles.storyLabel}>IVY MODA STORIES</span>
              <h2 className={styles.storyTitle}>VẺ ĐẸP HIỆN ĐẠI</h2>
              <p className={styles.storyDesc}>
                Khám phá phong cách sống và cảm hứng thời trang dẫn đầu xu hướng 
                từ các bộ sưu tập mang đậm dấu ấn sáng tạo và tinh thần đương đại.
              </p>
              <button className={styles.storyBtn}>XEM THÊM</button>
            </div>
            <div className={styles.storyGallery}>
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" alt="Story 1" />
              <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=600&q=80" alt="Story 2" />
            </div>
          </section>

          {/* 5. Instagram / Social Feed */}
          <section className={styles.socialSection}>
            <h2 className={styles.socialTitle}>#IVYmoda ON INSTAGRAM</h2>
            <div className={styles.socialGrid}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={styles.socialItem}>
                  <img src={`https://images.unsplash.com/photo-1596483562305-64c39f139580?w=300&q=80`} alt="Insta" />
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
