import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { BiCalendar, BiUser, BiArrowBack } from 'react-icons/bi';
import { blogPosts, blogCategories } from '../../data/blogData';
import styles from './BlogDetail.module.css';

function BlogDetail() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className={styles.notFound}>
        <h2>Article not found</h2>
        <Link to="/blog" className={styles.backLink}>← Back to Blog</Link>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Get related posts (same category, exclude current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // If not enough related posts in same category, fill with other posts
  const additionalPosts = relatedPosts.length < 3
    ? blogPosts.filter(p => p.id !== post.id && !relatedPosts.find(r => r.id === p.id)).slice(0, 3 - relatedPosts.length)
    : [];

  const allRelated = [...relatedPosts, ...additionalPosts];

  return (
    <div className={styles.detailPage}>
      {/* Hero Image */}
      <motion.section
        className={styles.heroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img src={post.coverImage} alt={post.title} className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className={styles.heroCategory}>
            {blogCategories.find(c => c.key === post.category)?.label}
          </span>
          <h1 className={styles.heroTitle}>{post.title}</h1>
          <div className={styles.heroMeta}>
            <span className={styles.metaItem}>
              <BiUser /> {post.author}
            </span>
            <span className={styles.metaDivider}>•</span>
            <span className={styles.metaItem}>
              <BiCalendar /> {formatDate(post.createdAt)}
            </span>
          </div>
        </motion.div>
      </motion.section>

      {/* Article Content */}
      <motion.section
        className={styles.articleSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        <Link to="/blog" className={styles.backBtn}>
          <BiArrowBack /> Back to Blog
        </Link>

        <div
          className={styles.articleContent}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.section>

      {/* Related Posts */}
      {allRelated.length > 0 && (
        <section className={styles.relatedSection}>
          <motion.div
            className={styles.relatedHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.relatedLabel}>KEEP READING</span>
            <h2 className={styles.relatedTitle}>Related Articles</h2>
          </motion.div>
          <div className={styles.relatedGrid}>
            {allRelated.map((rPost, idx) => (
              <motion.div
                key={rPost.id}
                className={styles.relatedCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -6 }}
              >
                <Link to={`/blog/${rPost.slug}`} className={styles.relatedLink}>
                  <div className={styles.relatedImgWrap}>
                    <img src={rPost.coverImage} alt={rPost.title} />
                  </div>
                  <div className={styles.relatedInfo}>
                    <span className={styles.relatedDate}>{formatDate(rPost.createdAt)}</span>
                    <h4 className={styles.relatedPostTitle}>{rPost.title}</h4>
                    <span className={styles.relatedReadMore}>Read More →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default BlogDetail;
