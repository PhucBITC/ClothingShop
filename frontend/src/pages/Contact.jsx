import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BiMap, BiEnvelope, BiPhone, BiTime, BiLoaderAlt } from 'react-icons/bi';
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from 'react-icons/fa';
import axios from '../api/axios';
import { useSettings } from '../context/SettingsContext';
import styles from './Contact.module.css';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: "easeOut" }
};

function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const contactInfo = [
    {
      icon: <BiMap />,
      title: 'Visit Us',
      lines: [settings.store_address]
    },
    {
      icon: <BiEnvelope />,
      title: 'Email Us',
      lines: [settings.store_email]
    },
    {
      icon: <BiPhone />,
      title: 'Call Us',
      lines: [settings.store_phone]
    },
    {
      icon: <BiTime />,
      title: 'Working Hours',
      lines: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM']
    }
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, url: '#', label: 'Facebook' },
    { icon: <FaInstagram />, url: '#', label: 'Instagram' },
    { icon: <FaTwitter />, url: '#', label: 'Twitter' },
    { icon: <FaPinterestP />, url: '#', label: 'Pinterest' }
  ];

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg('Please fill in all fields.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      await axios.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Header */}
      <section className={styles.contactHeader}>
        <motion.div
          className={styles.headerContent}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className={styles.headerLabel}>GET IN TOUCH</span>
          <h1 className={styles.headerTitle}>Contact Us</h1>
          <p className={styles.headerDesc}>
            We'd love to hear from you. Reach out with any questions, feedback, or collaboration inquiries.
          </p>
        </motion.div>
      </section>

      {/* Contact Info Cards */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          {contactInfo.map((info, idx) => (
            <motion.div
              key={idx}
              className={styles.infoCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
            >
              <div className={styles.infoIcon}>{info.icon}</div>
              <h4 className={styles.infoTitle}>{info.title}</h4>
              {info.lines.map((line, i) => (
                <p key={i} className={styles.infoLine}>{line}</p>
              ))}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className={styles.mainSection}>
        <motion.div className={styles.formWrap} {...fadeInUp}>
          <span className={styles.sectionLabel}>SEND US A MESSAGE</span>
          <h2 className={styles.sectionTitle}>Drop a Line</h2>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind..."
                className={styles.textarea}
                rows={6}
              />
            </div>

            {status === 'error' && (
              <motion.p
                className={styles.errorMsg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errorMsg}
              </motion.p>
            )}
            {status === 'success' && (
              <motion.p
                className={styles.successMsg}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ✓ Thank you! Your message has been sent successfully.
              </motion.p>
            )}

            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={status === 'sending'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === 'sending' ? (
                <><BiLoaderAlt className={styles.spinner} /> Sending...</>
              ) : (
                'Send Message'
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          className={styles.mapWrap}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <iframe
            title="Store Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197956!2d106.69914021531828!3d10.77629289231971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x1787cc26d4942bc4!2sBen%20Thanh%20Market!5e0!3m2!1sen!2svn!4v1679384400000!5m2!1sen!2svn"
            className={styles.mapFrame}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </section>

      {/* Social Links */}
      <section className={styles.socialSection}>
        <motion.div
          className={styles.socialContent}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.sectionLabel}>FOLLOW US</span>
          <h2 className={styles.sectionTitle}>Stay Connected</h2>
          <div className={styles.socialIcons}>
            {socialLinks.map((social, idx) => (
              <motion.a
                key={idx}
                href={social.url}
                className={styles.socialIcon}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Contact;
