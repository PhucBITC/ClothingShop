import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay } from 'react-icons/fa';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <span className={styles.logo}>Krist</span>
          <div className={styles.contactInfo}>
            <p><strong>(704) 555-0127</strong></p>
            <p><strong>krist@example.com</strong></p>
            <p>3891 Ranchview Dr. Richardson, California 62639</p>
          </div>
        </div>

        {/* Information Column */}
        <div>
          <h5 className={styles.columnTitle}>Information</h5>
          <ul className={styles.linkList}>
            <li><Link to="/account">My Account</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/wishlist">My Wishlist</Link></li>
            <li><Link to="/checkout">Checkout</Link></li>
          </ul>
        </div>

        {/* Service Column */}
        <div>
          <h5 className={styles.columnTitle}>Service</h5>
          <ul className={styles.linkList}>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/delivery">Delivery Information</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Subscribe Column */}
        <div>
          <h5 className={styles.columnTitle}>Subscribe</h5>
          <p style={{ color: '#d0d0d0', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Enter your email below to be the first to know about new collections and product launches.
          </p>
          <form className={styles.subscribeForm}>
            <input type="email" placeholder="Your Email" className={styles.emailInput} />
            <button type="submit" className={styles.subscribeBtn}>Subscribe</button>
          </form>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.paymentIcons}>
          <FaCcVisa /> <FaCcMastercard /> <FaCcPaypal /> <FaCcApplePay />
        </div>
        <p className={styles.copyright}>©2024 Krist. All Rights are reserved</p>
        <div className={styles.paymentIcons}>
          <FaFacebookF size={18} /> <FaInstagram size={18} /> <FaTwitter size={18} />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
