import React, { useState } from 'react';
import { BiSearch, BiShoppingBag, BiChevronDown, BiTrash, BiMenu, BiX, BiUser, BiPackage, BiCog, BiLogOut } from 'react-icons/bi';
import { Link, NavLink } from 'react-router-dom';
import { products } from '../data/mockData';
import styles from './Header.module.css';
import logo from '../assets/logo.png';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from './common/toast/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './common/modal/ConfirmModal';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', data: null });

    const { wishlistItems } = useWishlist();
    const { cartItems, cartCount, subtotal, removeFromCart, removeMultipleFromCart, clearCart } = useCart();
    const { user, logout } = useAuth();
    const toast = useToast();

    const handleSelectItem = (id, variantId) => {
        const itemKey = `${id}-${variantId}`;
        setSelectedItems(prev =>
            prev.includes(itemKey)
                ? prev.filter(k => k !== itemKey)
                : [...prev, itemKey]
        );
    };

    const handleConfirmAction = () => {
        const { type, data } = modalConfig;

        if (type === 'SINGLE') {
            removeFromCart(data.id, data.variantId);
            setSelectedItems(prev => prev.filter(k => k !== `${data.id}-${data.variantId}`));
            toast.success("Item removed from cart");
        } else if (type === 'MULTIPLE') {
            removeMultipleFromCart(data.items.map(i => ({ id: i.id, variantId: i.variantId })));
            setSelectedItems([]);
            toast.success(`${data.items.length} items removed from cart`);
        } else if (type === 'CLEAR') {
            clearCart();
            setSelectedItems([]);
            toast.success("Cart has been cleared");
        } else if (type === 'LOGOUT') {
            logout();
            toast.success("Logged out successfully");
        }

        setModalConfig({ isOpen: false, type: '', data: null });
    };

    const handleRemoveSelected = () => {
        const toRemove = cartItems.filter(item => selectedItems.includes(`${item.id}-${item.variantId}`));
        if (toRemove.length === 0) return;
        setModalConfig({
            isOpen: true,
            type: 'MULTIPLE',
            data: { items: toRemove }
        });
    };

    const handleClearCart = () => {
        if (cartItems.length === 0) return;
        setModalConfig({
            isOpen: true,
            type: 'CLEAR',
            data: null
        });
    };

    const handleSingleRemove = (id, variantId, name) => {
        setModalConfig({
            isOpen: true,
            type: 'SINGLE',
            data: { id, variantId, name }
        });
    };

    // Check for admin role
    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN';

    // Helper to check active state for standard links
    const getNavLinkClass = ({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className={styles.header}>
            {/* Hamburger Menu (Mobile) */}
            <button className={styles.mobileMenuBtn} onClick={toggleMenu} aria-label="Toggle Menu">
                {isMenuOpen ? <BiX /> : <BiMenu />}
            </button>

            {/* Logo */}
            <Link to="/" className={styles.logo} onClick={closeMenu}>
                <img src={logo} alt="Lighter & Princess" className={styles.logoImg} />
            </Link>

            {/* Navigation */}
            <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
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
                <Link to="/user/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                    <FiHeart />
                    {wishlistItems.length > 0 && <span className={styles.cartBadge}>{wishlistItems.length}</span>}
                </Link>

                {/* Cart with MiniCart Hover */}
                <div className={styles.cartContainer}>
                    <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
                        <BiShoppingBag />
                        {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                    </Link>

                    {/* MiniCart Dropdown */}
                    <div className={styles.miniCart}>
                        <div className={styles.miniCartHeader}>
                            <span>You have {cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
                            {cartCount > 0 && (
                                <button className={styles.clearAllBtn} onClick={handleClearCart}>Clear All</button>
                            )}
                        </div>

                        <div className={styles.miniCartItems}>
                            {cartItems.map((item) => (
                                <div key={`${item.id}-${item.variantId}`} className={styles.miniCartItem}>
                                    <div className={styles.itemSelector}>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(`${item.id}-${item.variantId}`)}
                                            onChange={() => handleSelectItem(item.id, item.variantId)}
                                        />
                                    </div>
                                    <img src={item.image} alt={item.name} className={styles.miniCartImg} />
                                    <div className={styles.miniCartInfo}>
                                        <h4 className={styles.miniCartTitle}>{item.name}</h4>
                                        <div className={styles.miniCartPrice}>{item.quantity} x ${item.price.toFixed(2)}</div>
                                        <div className={styles.miniCartSize}>Size: {item.size}</div>
                                    </div>
                                    <button
                                        className={styles.removeItemBtn}
                                        onClick={() => handleSingleRemove(item.id, item.variantId, item.name)}
                                    >
                                        <BiTrash />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {cartItems.length > 0 && (
                            <div className={styles.miniCartFooter}>
                                {selectedItems.length > 0 && (
                                    <button className={styles.removeSelectedBtn} onClick={handleRemoveSelected}>
                                        Remove Selected ({selectedItems.length})
                                    </button>
                                )}
                                <div className={styles.miniCartSubtotal}>
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className={styles.miniCartActions}>
                                    <Link to="/cart" className={styles.viewCartBtn}>View Cart</Link>
                                    <Link to="/checkout" className={styles.checkoutBtn}>Checkout</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {user ? (
                    <div className={styles.userAccount}>
                        <div className={styles.userTrigger}>
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080/api/files/${user.avatarUrl}`}
                                    alt={user.fullName}
                                    className={styles.userAvatar}
                                />
                            ) : (
                                <div className={styles.userInitial}>
                                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <span className={styles.userName}>{user.fullName}</span>
                            <BiChevronDown />
                        </div>

                        <div className={styles.userDropdown}>
                            {isAdmin && (
                                <Link to="/admin" className={styles.userMenuLink} style={{ color: '#FF8800', fontWeight: 'bold' }}>
                                    <BiCog /> System Management
                                </Link>
                            )}
                            <Link to="/user/profile" className={styles.userMenuLink}>
                                <BiUser /> My Profile
                            </Link>
                            <Link to="/user/orders" className={styles.userMenuLink}>
                                <BiPackage /> My Orders
                            </Link>
                            <Link to="/user/wishlist" className={styles.userMenuLink}>
                                <FiHeart /> Wishlist
                            </Link>
                            <Link to="/user/settings" className={styles.userMenuLink}>
                                <BiCog /> Settings
                            </Link>
                            <button
                                onClick={() => setModalConfig({ isOpen: true, type: 'LOGOUT', data: null })}
                                className={styles.logoutBtn}
                            >
                                <BiLogOut /> Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" className={styles.loginBtn}>Login</Link>
                )}
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleConfirmAction}
                title={
                    modalConfig.type === 'CLEAR' ? 'Clear Cart' :
                        modalConfig.type === 'MULTIPLE' ? 'Delete Items' :
                            modalConfig.type === 'LOGOUT' ? 'Logout Confirmation' :
                                'Confirm Delete'
                }
                message={
                    modalConfig.type === 'SINGLE'
                        ? 'Are you sure you want to delete'
                        : modalConfig.type === 'MULTIPLE'
                            ? `Are you sure you want to delete ${modalConfig.data?.items.length} selected items`
                            : modalConfig.type === 'LOGOUT'
                                ? 'Are you sure you want to logout from your account'
                                : 'Are you sure you want to clear your entire cart'
                }
                itemName={
                    modalConfig.type === 'SINGLE' ? modalConfig.data?.name :
                        modalConfig.type === 'LOGOUT' ? (user?.fullName || '') : ''
                }
                confirmText={modalConfig.type === 'LOGOUT' ? 'Logout' : 'Delete'}
                confirmColor={modalConfig.type === 'LOGOUT' ? '#dc2626' : '#dc2626'}
            />
        </header>
    );
}

export default Header;