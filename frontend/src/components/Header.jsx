import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BiSearch, BiShoppingBag } from 'react-icons/bi';
import { FiHeart } from 'react-icons/fi';
import styles from './Header.module.css';

function Header() {
    return (
        <header className={styles.header}>
            {/* Logo */}
            <Link to="/" className={styles.logo}>Krist</Link>

            {/* Navigation */}
            <nav className={styles.nav}>
                <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Home</NavLink>
                <NavLink to="/shop" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Shop</NavLink>
                <NavLink to="/story" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Our Story</NavLink>
                <NavLink to="/blog" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Blog</NavLink>
                <NavLink to="/contact" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Contact Us</NavLink>
            </nav>

            {/* Actions */}
            <div className={styles.actions}>
                <button className={styles.iconBtn} aria-label="Search">
                    <BiSearch />
                </button>
                <button className={styles.iconBtn} aria-label="Wishlist">
                    <FiHeart />
                </button>
                <button className={styles.iconBtn} aria-label="Cart">
                    <BiShoppingBag />
                </button>

                <Link to="/login" className={styles.loginBtn}>Login</Link>
            </div>
        </header>
    );
}

export default Header;