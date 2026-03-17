import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
    BiGridAlt, BiCart, BiPackage, BiUser,
    BiFile, BiPurchaseTag, BiLink, BiHelpCircle,
    BiCog, BiSearch, BiBell, BiMessageDetail, BiChevronDown, BiLogOut, BiStore,
    BiSun, BiMoon
} from 'react-icons/bi';
import styles from './AdminLayout.module.css';
import logo from '../../assets/logo.png';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [recentMessages, setRecentMessages] = useState([]);
    const [isMessageDropdownOpen, setIsMessageDropdownOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [viewingMessage, setViewingMessage] = useState(null);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const refreshAllCounts = async () => {
        try {
            // Messages
            const unreadRes = await axios.get('/contact/unread-count');
            setUnreadMessages(unreadRes.data);
            const recentRes = await axios.get('/contact');
            setRecentMessages(recentRes.data.slice(0, 5));

            // Notifications
            const unreadNotifRes = await axios.get('/notifications/unread-count');
            setUnreadNotifications(unreadNotifRes.data);
            const recentNotifRes = await axios.get('/notifications');
            setRecentNotifications(recentNotifRes.data.slice(0, 5));
        } catch (error) {
            console.error('Error refreshing admin counts:', error);
        }
    };

    const handleViewMessage = async (msg) => {
        setViewingMessage(msg);
        setIsMessageDropdownOpen(false);
        if (!msg.isRead) {
            try {
                await axios.put(`/contact/${msg.id}/read`);
                refreshAllCounts();
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    };

    useEffect(() => {
        refreshAllCounts();
        // Refresh every 30 seconds
        const interval = setInterval(refreshAllCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close sidebar when navigating on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Request full screen for mobile (optional, but good for admin apps)

    // Mapping paths to titles for the topbar
    const getPageTitle = (pathname) => {
        if (pathname.includes('/admin/orders')) return 'Orders';
        if (pathname.includes('/admin/products')) return 'Products';
        if (pathname.includes('/admin/categories')) return 'Categories';
        if (pathname.includes('/admin/customers')) return 'Customers';
        if (pathname.includes('/admin/notifications')) return 'Notifications';
        if (pathname === '/admin') return 'Dashboard';
        return 'Dashboard';
    };

    const currentTitle = getPageTitle(location.pathname);

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <BiGridAlt />, end: true },
        { name: 'Orders', path: '/admin/orders', icon: <BiCart /> },
        { name: 'Products', path: '/admin/products', icon: <BiPackage /> },
        { name: 'Categories', path: '/admin/categories', icon: <BiGridAlt /> },
        { name: 'Customers', path: '/admin/customers', icon: <BiUser /> },
        { name: 'Notifications', path: '/admin/notifications', icon: <BiBell /> },
        { name: 'Reports', path: '/admin/reports', icon: <BiFile /> },
        { name: 'Discounts', path: '/admin/discounts', icon: <BiPurchaseTag /> },
        { name: 'Integrations', path: '/admin/integrations', icon: <BiLink /> },
        { name: 'Help', path: '/admin/help', icon: <BiHelpCircle /> },
        { name: 'Settings', path: '/admin/settings', icon: <BiCog /> },
    ];

    const getAvatarUrl = (url) => {
        if (!url) return "https://i.pravatar.cc/150?img=12";
        if (url.startsWith('http')) return url;
        return `http://localhost:8080/api/files/${url}`;
    };

    return (
        <div className={styles.adminContainer}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.showSidebar : ''}`}>
                <div className={styles.logoContainer}>
                    <Link to="/" className={styles.logoLink}>
                        <img src={logo} alt="Logo" className={styles.logo} />
                    </Link>
                    <button
                        className={styles.closeSidebarBtn}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        &times;
                    </button>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                            }
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Topbar */}
                <header className={styles.topbar}>
                    <div className={styles.leftSection}>
                        <button
                            className={styles.menuBtn}
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <BiSearch size={24} style={{ display: 'none' }} /> {/* Wrong icon place holder, fixing below */}
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path></svg>
                        </button>
                        <h1 className={styles.pageTitle}>{currentTitle}</h1>
                    </div>

                    <div className={styles.searchBar}>
                        <BiSearch color="#999" size={20} />
                        <input type="text" placeholder="Search..." className={styles.searchInput} />
                    </div>

                    <div className={styles.topbarActions}>
                        {/* Theme Toggle */}
                        <button 
                            className={styles.actionIcon} 
                            onClick={toggleTheme}
                            title={theme === 'Light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'Light' ? <BiMoon /> : <BiSun />}
                        </button>

                        <div className={styles.actionIconContainer}>
                            <button 
                                className={styles.actionIcon} 
                                onClick={() => {
                                    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
                                }}
                            >
                                <BiBell />
                                {(unreadNotifications + unreadMessages) > 0 && (
                                    <span className={styles.notificationBadge}>
                                        {(unreadNotifications + unreadMessages) > 9 ? '9+' : (unreadNotifications + unreadMessages)}
                                    </span>
                                )}
                            </button>

                            {isNotificationDropdownOpen && (
                                <>
                                    <div className={styles.dropdownOverlay} onClick={() => setIsNotificationDropdownOpen(false)} />
                                    <div className={styles.messageDropdown}>
                                        <div className={styles.dropdownHeader}>
                                            <h3>Notifications Hub</h3>
                                            <NavLink to="/admin/notifications" onClick={() => setIsNotificationDropdownOpen(false)}>
                                                View All
                                            </NavLink>
                                        </div>
                                        <div className={styles.dropdownBody}>
                                            {recentNotifications.length > 0 ? (
                                                recentNotifications.map(notif => (
                                                    <div 
                                                        key={notif.id} 
                                                        className={`${styles.dropdownItem} ${!notif.isRead ? styles.unread : ''}`}
                                                        onClick={async () => {
                                                            if (!notif.isRead) {
                                                                try {
                                                                    await axios.patch(`/notifications/${notif.id}/read`);
                                                                    refreshAllCounts();
                                                                } catch (err) {
                                                                    console.error("Error marking notif as read:", err);
                                                                }
                                                            }
                                                            setIsNotificationDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className={styles.itemHeader}>
                                                            <span className={styles.itemName}>{notif.title}</span>
                                                            <span className={styles.itemDate}>
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className={styles.itemSnippet}>{notif.content}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={styles.emptyDropdown}>No notifications yet</div>
                                            )}
                                        </div>
                                        <NavLink 
                                            to="/admin/notifications" 
                                            className={styles.dropdownFooter}
                                            onClick={() => setIsNotificationDropdownOpen(false)}
                                        >
                                            View all in Notifications Center
                                        </NavLink>
                                    </div>
                                </>
                            )}
                        </div>


                        <div className={styles.userProfileContainer}>
                            <div 
                                className={styles.userProfile}
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            >
                                <img src={getAvatarUrl(user?.avatarUrl)} alt="Admin" className={styles.avatar} />
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{user?.fullName || 'Admin User'}</span>
                                    <span className={styles.userRole}>{user?.role || 'Admin'}</span>
                                </div>
                                <BiChevronDown className={`${styles.chevron} ${isUserDropdownOpen ? styles.rotate : ''}`} />
                            </div>

                            {isUserDropdownOpen && (
                                <>
                                    <div className={styles.dropdownOverlay} onClick={() => setIsUserDropdownOpen(false)} />
                                    <div className={styles.userDropdownMenu}>
                                        <div className={styles.userDropdownHeader}>
                                            <p className={styles.userEmail}>{user?.email}</p>
                                        </div>
                                        <div className={styles.userDropdownDivider} />
                                        <NavLink to="/admin/profile" className={styles.userDropdownItem} onClick={() => setIsUserDropdownOpen(false)}>
                                            <BiUser /> Profile Settings
                                        </NavLink>
                                        <Link to="/" className={styles.userDropdownItem} onClick={() => setIsUserDropdownOpen(false)}>
                                            <BiStore /> View Storefront
                                        </Link>
                                        <div className={styles.userDropdownDivider} />
                                        <button 
                                            className={`${styles.userDropdownItem} ${styles.logoutBtn}`}
                                            onClick={() => {
                                                logout();
                                                setIsUserDropdownOpen(false);
                                                navigate('/login');
                                            }}
                                        >
                                            <BiLogOut /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <div className={styles.content}>
                    <Outlet context={{ refreshMessages: refreshAllCounts }} />
                </div>
            </main>
            {/* Quick View Modal */}
            {viewingMessage && (
                <div className={styles.modalOverlay} onClick={() => setViewingMessage(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setViewingMessage(null)}>&times;</button>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Message Quick-View</h2>
                        </div>
                        <div className={styles.modalInfo}>
                            <p><strong>From:</strong> {viewingMessage.name} ({viewingMessage.email})</p>
                            <p><strong>Date:</strong> {new Date(viewingMessage.createdAt).toLocaleString()}</p>
                        </div>
                        <div className={styles.modalBodyContent}>
                            {viewingMessage.message}
                        </div>
                        <div className={styles.modalFooterContent}>
                            <NavLink 
                                to="/admin/notifications" 
                                className={styles.goToInboxBtn}
                                onClick={() => setViewingMessage(null)}
                            >
                                Go to Center
                            </NavLink>
                            <button className={styles.closeBtn} onClick={() => setViewingMessage(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
