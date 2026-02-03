import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar, FaInstagram } from 'react-icons/fa';
import { BiShoppingBag, BiHeart, BiSearch } from 'react-icons/bi';
import styles from './Home.module.css';
import { categories, bestsellers, reviews, services } from '../data/mockData';

function Home() {
  return (
    <div className={styles.homeContainer}>

      {/* --- HERO SECTION --- */}
      <section className={styles.heroSection}>
        <div className={styles.heroBgText}>BEST</div>

        <div className={styles.heroContent}>
          <h4 className={styles.heroSubTitle}>Classic Exclusive</h4>
          <h1 className={styles.heroTitle}>Women's Collection</h1>
          <h3 className={styles.heroOffer}>UPTO 40% OFF</h3>
          <Link to="/shop" className={styles.heroBtn}>
            Shop Now <FaArrowRight />
          </Link>
        </div>

        <div className={styles.heroImageWrapper}>
          {/* Placeholder for the main model image */}
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"
            alt="Women's Collection"
            className={styles.heroImage}
            style={{ mixBlendMode: 'multiply' }} /* Trick to blend simple bg images */
          />
        </div>
      </section>

      {/* --- CATEGORIES --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Categories</h2>
          <div>{/* Space for arrows if needed */}</div>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map(cat => (
            <div key={cat.id} className={styles.categoryCard}>
              <img src={cat.image} alt={cat.name} className={styles.catImage} />
              <div className={styles.catLabel}>{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- BESTSELLERS --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Bestseller</h2>
        </div>

        <div className={styles.productGrid}>
          {bestsellers.map(product => (
            <div key={product.id} className={styles.productCard}>
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.productImgContainer}>
                  <img src={product.image} alt={product.name} className={styles.productImg} />
                  <div className={styles.productActions}>
                    <button className={styles.actionBtn}><BiHeart /></button>
                    <button className={styles.actionBtn}><BiSearch /></button>
                    <button className={styles.actionBtn}><BiShoppingBag /></button>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <h4 className={styles.productName}>{product.name}</h4>
                  <div className={styles.productBrand}>{product.brand}</div>
                  <div className={styles.priceRow}>
                    <span className={styles.currentPrice}>${product.price.toFixed(2)}</span>
                    <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* --- DEALS OF THE MONTH --- */}
      <section className={styles.dealSection}>
        <div className={styles.dealContent}>
          <h2 className={styles.sectionTitle}>Deals of the Month</h2>
          <p style={{ marginBottom: '2rem', color: '#555' }}>
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
          </p>

          <div className={styles.countdown}>
            <div className={styles.timeBox}>
              <span className={styles.timeVal}>120</span>
              <span className={styles.timeLabel}>Days</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.timeVal}>18</span>
              <span className={styles.timeLabel}>Hours</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.timeVal}>15</span>
              <span className={styles.timeLabel}>Mins</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.timeVal}>10</span>
              <span className={styles.timeLabel}>Secs</span>
            </div>
          </div>

          <Link to="/shop" className={styles.heroBtn}>
            View All Products <FaArrowRight />
          </Link>
        </div>
        <div className={styles.dealImageWrapper}>
          <img
            src="https://images.unsplash.com/photo-1545959795-322b27154564?w=800&q=80"
            alt="Deal of the Month"
            className={styles.dealImage}
          />
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>What our Customer say's</h2>
        </div>

        <div className={styles.reviewGrid}>
          {reviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.stars}>
                {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
              </div>
              <p className={styles.reviewText}>"{review.comment}"</p>
              <div className={styles.reviewer}>
                <img src={review.image} alt={review.name} className={styles.avatar} />
                <div>
                  <strong>{review.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- INSTAGRAM STORIES --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Instagram Stories</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1596483562305-64c39f139580?w=300&q=80" alt="Insta" style={{ flex: 1, height: '250px', objectFit: 'cover' }} />
          <img src="https://images.unsplash.com/photo-1596483562479-566b7c8df4f8?w=300&q=80" alt="Insta" style={{ flex: 1, height: '250px', objectFit: 'cover' }} />
          <img src="https://images.unsplash.com/photo-1596483562237-7096752e5055?w=300&q=80" alt="Insta" style={{ flex: 1, height: '250px', objectFit: 'cover' }} />
          <img src="https://images.unsplash.com/photo-1596483562386-896db841f32a?w=300&q=80" alt="Insta" style={{ flex: 1, height: '250px', objectFit: 'cover' }} />
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className={styles.featuresSection}>
        {services.map(service => (
          <div key={service.id} className={styles.featureItem}>
            <service.icon className={styles.featureIcon} />
            <div>
              <div className={styles.featureTitle}>{service.title}</div>
              <div className={styles.featureDesc}>{service.desc}</div>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}

export default Home;
