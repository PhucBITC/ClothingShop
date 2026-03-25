import React, { useState } from 'react';
import { BiSearch, BiShoppingBag, BiChevronDown, BiTrash, BiMenu, BiX, BiUser, BiPackage, BiCog, BiLogOut, BiBell, BiLock, BiChevronLeft } from 'react-icons/bi';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { products } from '../data/mockData';
import styles from './Header.module.css';
import logo from '../assets/logo.png';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from './common/toast/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import ConfirmModal from './common/modal/ConfirmModal';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', data: null });
    const [selectedNote, setSelectedNote] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const navigate = useNavigate();

    const { wishlistItems } = useWishlist();
    const { cartItems, cartCount, subtotal, removeFromCart, removeMultipleFromCart, clearCart } = useCart();
    const { user, logout } = useAuth();
    const { unreadCount, notifications, markAsRead, markAllAsRead, deleteAllNotifications } = useNotifications();
    const { settings, formatPrice } = useSettings();
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
            toast.success("Logged out", "You have been logged out successfully");
            setModalConfig({ isOpen: false, type: '', data: null });
            navigate('/login');
            return;
        } else if (type === 'LOGIN') {
            toast.info("Redirecting to login...");
            navigate('/login', { state: { from: '/checkout' } });
        }

        setModalConfig({ isOpen: false, type: '', data: null });
    };

    // Fetch categories for mega menu
    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/categories');
                setCategories(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Group categories by type
    const groupedCategories = categories.reduce((acc, cat) => {
        const type = cat.categoryType || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(cat);
        return acc;
    }, {});

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
                <img src={logo} alt={settings.store_name} className={styles.logoImg} />
            </Link>

            {/* Navigation */}
            <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                <div className={styles.navItem}>
                    <NavLink to="/" className={getNavLinkClass}><span title="Home">Home</span></NavLink>
                </div>

                {/* Shop Mega Menu Trigger */}
                <div 
                    className={styles.navItem}
                    onMouseEnter={() => setShowMegaMenu(true)}
                    onMouseLeave={() => setShowMegaMenu(false)}
                >
                    <NavLink to="/products" className={`${styles.navLink} ${styles.shopTrigger}`}>
                        <span title="Shop">Shop</span> <BiChevronDown />
                    </NavLink>

                    {/* Mega Menu Content */}
                    <div className={`${styles.megaMenu} ${showMegaMenu ? styles.show : ''}`}>
                        {Object.entries(groupedCategories).length > 0 ? (
                            Object.entries(groupedCategories).map(([type, items]) => (
                                <div key={type} className={styles.menuColumn}>
                                    <h4 className={styles.columnTitle}>{type}</h4>
                                    <ul className={styles.columnLinks}>
                                        {items.map(cat => (
                                            <li key={cat.id}>
                                                <Link 
                                                    to={`/products?category=${cat.id}`} 
                                                    onClick={() => {
                                                        closeMenu();
                                                        setShowMegaMenu(false);
                                                    }}
                                                >
                                                    {cat.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noCategories}>No categories found</div>
                        )}
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
                                        <div className={styles.miniCartPrice}>{item.quantity} x {formatPrice(item.price)}</div>
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
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className={styles.miniCartActions}>
                                    <Link to="/cart" className={styles.viewCartBtn}>View Cart</Link>
                                    <button 
                                        className={styles.checkoutBtn}
                                        onClick={() => {
                                            if (!user) {
                                                setModalConfig({
                                                    isOpen: true,
                                                    type: 'LOGIN',
                                                    data: null
                                                });
                                            } else {
                                                navigate('/checkout');
                                            }
                                        }}
                                    >
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications with MiniNotification Hover */}
                <div className={styles.notifContainer}>
                    <Link to="/user/notifications" className={styles.iconBtn} aria-label="Notifications">
                        <BiBell />
                        {unreadCount > 0 && <span className={styles.cartBadge}>{unreadCount}</span>}
                    </Link>

                    <div className={styles.miniNotif} onMouseLeave={() => setSelectedNote(null)}>
                        <div className={styles.miniNotifHeader}>
                            <span>{selectedNote ? 'Notification Detail' : 'Notifications'}</span>
                            {!selectedNote && notifications.length > 0 && (
                                <button className={styles.clearAllBtn} onClick={deleteAllNotifications}>Clear All</button>
                            )}
                        </div>

                        <div className={styles.miniNotifItems}>
                            {selectedNote ? (
                                <div className={styles.miniNotifDetail}>
                                    <button className={styles.backBtn} onClick={() => setSelectedNote(null)}>
                                        <BiChevronLeft /> Back
                                    </button>
                                    <h4 className={styles.detailTitle}>{selectedNote.title}</h4>
                                    <p className={styles.detailContent}>{selectedNote.content}</p>
                                    <span className={styles.detailTime}>
                                        {new Date(selectedNote.createdAt || Date.now()).toLocaleString()}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    {notifications.length > 0 ? (
                                        notifications.slice(0, 5).map((note) => (
                                            <div
                                                key={note.id}
                                                className={`${styles.miniNotifItem} ${!note.isRead ? styles.unread : ''}`}
                                                onClick={() => {
                                                    if (!note.isRead) markAsRead(note.id);
                                                    setSelectedNote(note);
                                                }}
                                            >
                                                <div className={styles.miniNotifIcon}>
                                                    {note.type === 'ORDER' ? <BiPackage /> :
                                                        note.type === 'SECURITY' ? <BiLock /> : <BiUser />}
                                                </div>
                                                <div className={styles.miniNotifInfo}>
                                                    <h4 className={styles.miniNotifTitle}>{note.title}</h4>
                                                    <p className={styles.miniNotifDesc}>{note.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.emptyNotif}>No new notifications</div>
                                    )}
                                </>
                            )}
                        </div>

                        {!selectedNote && (
                            <div className={styles.miniNotifFooter}>
                                {unreadCount > 0 && (
                                    <button className={styles.markAllReadBtn} onClick={markAllAsRead}>
                                        Mark all as read
                                    </button>
                                )}
                                <Link to="/user/notifications" className={styles.viewAllBtn}>View All</Link>
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
                            <Link to="/user/notifications" className={styles.userMenuLink}>
                                <BiBell /> Notifications
                                {unreadCount > 0 && <span className={styles.inlineBadge}>{unreadCount}</span>}
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
                                modalConfig.type === 'LOGIN' ? 'Login Required' :
                                    'Confirm Delete'
                }
                message={
                    modalConfig.type === 'SINGLE'
                        ? 'Are you sure you want to delete'
                        : modalConfig.type === 'MULTIPLE'
                            ? `Are you sure you want to delete ${modalConfig.data?.items.length} selected items`
                            : modalConfig.type === 'LOGOUT'
                                ? 'Are you sure you want to logout from your account'
                                : modalConfig.type === 'LOGIN'
                                    ? 'You need to be logged in to proceed to checkout'
                                    : 'Are you sure you want to clear your entire cart'
                }
                itemName={
                    modalConfig.type === 'SINGLE' ? modalConfig.data?.name :
                        modalConfig.type === 'LOGOUT' ? (user?.fullName || '') : ''
                }
                confirmText={
                    modalConfig.type === 'LOGOUT' ? 'Logout' : 
                        modalConfig.type === 'LOGIN' ? 'Login Now' : 'Delete'
                }
                confirmColor={
                    modalConfig.type === 'LOGOUT' ? '#dc2626' : 
                        modalConfig.type === 'LOGIN' ? '#D4A373' : '#dc2626'
                }
            />
        </header>
    );
}

export default Header;