import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BiSearch, BiShoppingBag, BiChevronDown } from 'react-icons/bi';
import { FiHeart } from 'react-icons/fi';
import styles from './Header.module.css';
import logo from '../assets/logo.png';

function Header() {
    // Helper to check active state for standard links
    const getNavLinkClass = ({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

    return (
        <header className={styles.header}>
            {/* Logo */}
            <Link to="/" className={styles.logo}>
                <img src={logo} alt="Lighter & Princess" className={styles.logoImg} />
            </Link>

            {/* Navigation */}
            <nav className={styles.nav}>
                <div className={styles.navItem}>
                    <NavLink to="/" className={getNavLinkClass}><span title="Home">Home</span></NavLink>
                </div>

                {/* Shop Mega Menu Trigger */}
                <div className={styles.navItem}>
                    <NavLink to="/products" className={`${styles.navLink} ${styles.shopTrigger}`}>
                        <span title="Shop">Shop</span> <BiChevronDown />
                    </NavLink>

                    {/* Mega Menu Content */}
                    <div className={styles.megaMenu}>
                        {/* Column 1: Men */}
                        <div className={styles.menuColumn}>
                            <h4 className={styles.columnTitle}>Men</h4>
                            <ul className={styles.columnLinks}>
                                <li><Link to="/shop/men-tshirts">T-Shirts</Link></li>
                                <li><Link to="/shop/men-casual-shirts">Casual Shirts</Link></li>
                                <li><Link to="/shop/men-formal-shirts">Formal Shirts</Link></li>
                                <li><Link to="/shop/men-jackets">Jackets</Link></li>
                                <li><Link to="/shop/men-blazers">Blazers & Coats</Link></li>
                            </ul>

                            <h4 className={styles.columnTitle} style={{ marginTop: '1rem' }}>Indian & Festive Wear</h4>
                            <ul className={styles.columnLinks}>
                                <li><Link to="/shop/kurtas">Kurtas & Kurta Sets</Link></li>
                                <li><Link to="/shop/sherwanis">Sherwanis</Link></li>
                            </ul>
                        </div>

                        {/* Column 2: Women */}
                        <div className={styles.menuColumn}>
                            <h4 className={styles.columnTitle}>Women</h4>
                            <ul className={styles.columnLinks}>
                                <li><Link to="/shop/women-kurtas">Kurtas & Suits</Link></li>
                                <li><Link to="/shop/sarees">Sarees</Link></li>
                                <li><Link to="/shop/ethnic-wear">Ethnic Wear</Link></li>
                                <li><Link to="/shop/lehengas">Lehenga Cholis</Link></li>
                                <li><Link to="/shop/women-jackets">Jackets</Link></li>
                            </ul>

                            <h4 className={styles.columnTitle} style={{ marginTop: '1rem' }}>Western Wear</h4>
                            <ul className={styles.columnLinks}>
                                <li><Link to="/shop/dresses">Dresses</Link></li>
                                <li><Link to="/shop/jumpsuits">Jumpsuits</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Footwear */}
                        <div className={styles.menuColumn}>
                            <h4 className={styles.columnTitle}>Footwear</h4>
                            <ul className={styles.columnLinks}>
                                <li><Link to="/shop/flats">Flats</Link></li>
                                <li><Link to="/shop/casual-shoes">Casual Shoes</Link></li>
                                <li><Link to="/shop/heels">Heels</Link></li>
                                <li><Link to="/shop/boots">Boots</Link></li>
                                <li><Link to="/shop/sports-shoes">Sports Shoes & Floaters</Link></li>
                            </ul>

                            <h4 className={styles.columnTitle} style={{ marginTop: '1rem' }}>Product Features</h4>
                            <ul className={styles.columnLinks}>
                                <li><Link to="/features/360">360 Product Viewer</Link></li>
                                <li><Link to="/features/video">Product with Video</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Kids & Others */}
                        <div className={styles.menuColumn}>
                            <h4 className={styles.columnTitle}>Kids</h4>
                            <ul className={styles.columnLinks}>
                                <li><Link to="/shop/kids-tshirts">T-Shirts</Link></li>
                                <li><Link to="/shop/kids-shirts">Shirts</Link></li>
                                <li><Link to="/shop/kids-jeans">Jeans</Link></li>
                                <li><Link to="/shop/kids-trousers">Trousers</Link></li>
                                <li><Link to="/shop/kids-party-wear">Party Wear</Link></li>
                                <li><Link to="/shop/kids-innerwear">Innerwear & Thermal</Link></li>
                                <li><Link to="/shop/kids-track-pants">Track Pants</Link></li>
                                <li><Link to="/shop/value-pack">Value Pack</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.navItem}>
                    <NavLink to="/story" className={getNavLinkClass}><span title="Our Story">Our Story</span></NavLink>
                </div>
                <div className={styles.navItem}>
                    <NavLink to="/blog" className={getNavLinkClass}><span title="Blog">Blog</span></NavLink>
                </div>
                <div className={styles.navItem}>
                    <NavLink to="/contact" className={getNavLinkClass}><span title="Contact Us">Contact Us</span></NavLink>
                </div>
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