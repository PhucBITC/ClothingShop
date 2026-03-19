import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { BiCalendar, BiUser, BiArrowBack, BiLoaderAlt } from 'react-icons/bi';
import axios from '../../api/axios';
import styles from './BlogDetail.module.css';

const blogCategories = [
  { key: 'ALL', label: 'All' },
  { key: 'TRENDS', label: 'Trends' },
  { key: 'STYLING_TIPS', label: 'Styling Tips' },
  { key: 'NEW_COLLECTION', label: 'New Collection' },
  { key: 'FASHION_GUIDE', label: 'Fashion Guide' }
];

function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/blogs/${slug}`);
      setPost(res.data);
      
      // Fetch all posts to find related ones (simplified)
      const allRes = await axios.get('/blogs');
      const allPosts = allRes.data;
      const related = allPosts
        .filter(p => p.category === res.data.category && p.id !== res.data.id)
        .slice(0, 3);
      
      const additional = related.length < 3
        ? allPosts.filter(p => p.id !== res.data.id && !related.find(r => r.id === p.id)).slice(0, 3 - related.length)
        : [];
      
      setRelatedPosts([...related, ...additional]);
      setError(null);
    } catch (err) {
      console.error('Error fetching blog detail:', err);
      setError('Article not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <BiLoaderAlt className={styles.spinner} />
        <p>Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.notFound}>
        <h2>{error || 'Article not found'}</h2>
        <Link to="/blog" className={styles.backLink}>← Back to Blog</Link>
      </div>
    );
  }

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
      {relatedPosts.length > 0 && (
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
            {relatedPosts.map((rPost, idx) => (
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
