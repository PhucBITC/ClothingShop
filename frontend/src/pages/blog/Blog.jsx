import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BiCalendar, BiUser } from 'react-icons/bi';
import { blogPosts, blogCategories } from '../../data/blogData';
import styles from './Blog.module.css';

function Blog() {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredPosts = activeCategory === 'ALL'
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className={styles.blogPage}>
      {/* Header Section */}
      <section className={styles.blogHeader}>
        <motion.div
          className={styles.headerContent}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className={styles.headerLabel}>OUR BLOG</span>
          <h1 className={styles.headerTitle}>Fashion Journal</h1>
          <p className={styles.headerDesc}>
            Explore the latest trends, styling tips, and fashion inspiration from our creative team.
          </p>
        </motion.div>
      </section>

      {/* Category Filter */}
      <section className={styles.filterSection}>
        <motion.div
          className={styles.filterTabs}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {blogCategories.map(cat => (
            <button
              key={cat.key}
              className={`${styles.filterTab} ${activeCategory === cat.key ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section className={styles.gridSection}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className={styles.blogGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                className={styles.blogCard}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/blog/${post.slug}`} className={styles.cardLink}>
                  <div className={styles.cardImageWrap}>
                    <img src={post.coverImage} alt={post.title} className={styles.cardImage} />
                    <span className={styles.cardCategory}>
                      {blogCategories.find(c => c.key === post.category)?.label}
                    </span>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>
                        <BiUser /> {post.author}
                      </span>
                      <span className={styles.metaItem}>
                        <BiCalendar /> {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    <span className={styles.readMore}>
                      Read More
                      <motion.span
                        className={styles.arrow}
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                      >
                        →
                      </motion.span>
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>No articles found in this category.</p>
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default Blog;
