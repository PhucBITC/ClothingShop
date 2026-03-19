import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BiLeaf, BiDiamond, BiPalette, BiHeart } from 'react-icons/bi';
import styles from './OurStory.module.css';
import studioImg from '../assets/our_studio.png';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: "easeOut" }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: "easeOut" }
};

const brandValues = [
  {
    icon: <BiLeaf />,
    title: 'Sustainability',
    desc: 'We are committed to sustainable fashion, using eco-friendly materials and ethical production processes to minimize our environmental footprint.'
  },
  {
    icon: <BiDiamond />,
    title: 'Quality',
    desc: 'Every piece is crafted with meticulous attention to detail, using premium fabrics and superior craftsmanship that stands the test of time.'
  },
  {
    icon: <BiPalette />,
    title: 'Modern Design',
    desc: 'Our designs blend contemporary trends with timeless elegance, creating pieces that are both fashionable and versatile for every occasion.'
  },
  {
    icon: <BiHeart />,
    title: 'Customer Experience',
    desc: 'We prioritize your experience from browsing to delivery, ensuring every interaction with our brand feels personal and exceptional.'
  }
];

const teamMembers = [
  {
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80',
    name: 'Linh Nguyen',
    role: 'Creative Director'
  },
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
    name: 'Minh Tran',
    role: 'Head of Design'
  },
  {
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80',
    name: 'Hana Pham',
    role: 'Production Manager'
  }
];
import { useSettings } from '../context/SettingsContext';

function OurStory() {
  const { settings } = useSettings();

  // Fallbacks for empty settings
  const storyTitle = settings.story_title || 'Where Elegance Meets Purpose';
  const storyContent = settings.story_content || 'Born in 2020 from a passion for contemporary fashion. We started with a simple belief that luxury should be accessible and sustainable.';
  const mission = settings.mission || 'To create thoughtfully designed fashion that empowers individuals to express their authentic selves.';
  const vision = settings.vision || 'To become a leading sustainable fashion brand, setting new standards for ethical production.';

  return (
    <div className={styles.storyPage}>
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.span
            className={styles.heroLabel}
            initial={{ opacity: 0, letterSpacing: '0px' }}
            animate={{ opacity: 1, letterSpacing: '6px' }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            {settings.store_name?.toUpperCase() || 'OUR STORY'}
          </motion.span>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {storyTitle}
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Crafting fashion that tells a story — your story.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. Brand Story Section */}
      <section className={styles.brandStory}>
        <motion.div className={styles.storyText} {...fadeInLeft}>
          <span className={styles.sectionLabel}>WHO WE ARE</span>
          <h2 className={styles.sectionTitle}>Our Story</h2>
          <div className={styles.storyParagraph} style={{ whiteSpace: 'pre-wrap' }}>
            {storyContent}
          </div>
        </motion.div>
        <motion.div className={styles.storyImage} {...fadeInRight}>
          <img
            src={studioImg}
            alt="Our studio"
          />
          <div className={styles.imageAccent} />
        </motion.div>
      </section>

      {/* 3. Mission & Vision */}
      <section className={styles.missionVision}>
        <motion.div className={styles.mvCard} {...fadeInUp}>
          <div className={styles.mvIconWrap}>
            <span className={styles.mvIcon}>✦</span>
          </div>
          <h3 className={styles.mvTitle}>Our Mission</h3>
          <p className={styles.mvText}>
            {mission}
          </p>
        </motion.div>
        <motion.div 
          className={styles.mvCard} 
          {...fadeInUp}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className={styles.mvIconWrap}>
            <span className={styles.mvIcon}>◆</span>
          </div>
          <h3 className={styles.mvTitle}>Our Vision</h3>
          <p className={styles.mvText}>
            {vision}
          </p>
        </motion.div>
      </section>

      {/* 4. Brand Values */}
      <section className={styles.valuesSection}>
        <motion.div className={styles.valuesSectionHeader} {...fadeInUp}>
          <span className={styles.sectionLabel}>WHAT WE BELIEVE IN</span>
          <h2 className={styles.sectionTitle}>Our Values</h2>
        </motion.div>
        <div className={styles.valuesGrid}>
          {brandValues.map((val, idx) => (
            <motion.div
              key={idx}
              className={styles.valueCard}
              {...scaleIn}
              transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.15 }}
            >
              <div className={styles.valueIcon}>{val.icon}</div>
              <h4 className={styles.valueTitle}>{val.title}</h4>
              <p className={styles.valueDesc}>{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Behind The Scenes / Team */}
      <section className={styles.teamSection}>
        <motion.div className={styles.teamHeader} {...fadeInUp}>
          <span className={styles.sectionLabel}>BEHIND THE SCENES</span>
          <h2 className={styles.sectionTitle}>Meet Our Team</h2>
          <p className={styles.teamSubtitle}>
            The creative minds bringing your fashion dreams to life.
          </p>
        </motion.div>
        <div className={styles.teamGrid}>
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              className={styles.teamCard}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
              whileHover={{ y: -8 }}
            >
              <div className={styles.teamImgWrap}>
                <img src={member.image} alt={member.name} />
              </div>
              <h4 className={styles.teamName}>{member.name}</h4>
              <span className={styles.teamRole}>{member.role}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className={styles.ctaSection}>
        <motion.div
          className={styles.ctaContent}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className={styles.ctaLabel}>DISCOVER MORE</span>
          <h2 className={styles.ctaTitle}>Explore Our Collection</h2>
          <p className={styles.ctaDesc}>
            Find your next statement piece from our latest curated collections.
          </p>
          <Link to="/products" className={styles.ctaBtn}>
            <motion.span
              whileHover={{ letterSpacing: '3px' }}
              transition={{ duration: 0.3 }}
            >
              EXPLORE COLLECTION
            </motion.span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

export default OurStory;
