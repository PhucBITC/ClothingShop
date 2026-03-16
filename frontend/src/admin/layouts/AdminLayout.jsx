import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    BiGridAlt, BiCart, BiPackage, BiUser,
    BiFile, BiPurchaseTag, BiLink, BiHelpCircle,
    BiCog, BiSearch, BiBell, BiMessageDetail, BiChevronDown
} from 'react-icons/bi';
import styles from './AdminLayout.module.css';
import logo from '../../assets/logo.png';
import axios from '../../api/axios';

const AdminLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [recentMessages, setRecentMessages] = useState([]);
    const [isMessageDropdownOpen, setIsMessageDropdownOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [viewingMessage, setViewingMessage] = useState(null);

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
        if (pathname.includes('/admin/messages')) return 'Messages';
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
        { name: 'Messages', path: '/admin/messages', icon: <BiMessageDetail /> },
        { name: 'Reports', path: '/admin/reports', icon: <BiFile /> },
        { name: 'Discounts', path: '/admin/discounts', icon: <BiPurchaseTag /> },
        { name: 'Integrations', path: '/admin/integrations', icon: <BiLink /> },
        { name: 'Help', path: '/admin/help', icon: <BiHelpCircle /> },
        { name: 'Settings', path: '/admin/settings', icon: <BiCog /> },
    ];

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
                    <img src={logo} alt="Logo" className={styles.logo} />
                    {/* <span className={styles.brandName}>EzMart</span> User wants the real logo, text might be in logo */}
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
                        <div className={styles.actionIconContainer}>
                            <button 
                                className={styles.actionIcon} 
                                onClick={() => {
                                    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
                                    setIsMessageDropdownOpen(false);
                                }}
                            >
                                <BiBell />
                                {unreadNotifications > 0 && (
                                    <span className={styles.notificationBadge}>
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {isNotificationDropdownOpen && (
                                <>
                                    <div className={styles.dropdownOverlay} onClick={() => setIsNotificationDropdownOpen(false)} />
                                    <div className={styles.messageDropdown}>
                                        <div className={styles.dropdownHeader}>
                                            <h3>Notifications</h3>
                                            <button 
                                                className={styles.markAllReadBtn}
                                                onClick={async () => {
                                                    try {
                                                        await axios.post('/notifications/mark-all-read');
                                                        refreshAllCounts();
                                                    } catch (err) {
                                                        console.error("Error marking all as read:", err);
                                                    }
                                                }}
                                            >
                                                Mark all as read
                                            </button>
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
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.actionIconContainer}>
                            <button 
                                className={styles.actionIcon} 
                                onClick={() => {
                                    setIsMessageDropdownOpen(!isMessageDropdownOpen);
                                    setIsNotificationDropdownOpen(false);
                                }}
                            >
                                <BiMessageDetail />
                                {unreadMessages > 0 && (
                                    <span className={styles.messageBadge}>
                                        {unreadMessages > 9 ? '9++' : unreadMessages}
                                    </span>
                                )}
                            </button>

                            {isMessageDropdownOpen && (
                                <>
                                    <div className={styles.dropdownOverlay} onClick={() => setIsMessageDropdownOpen(false)} />
                                    <div className={styles.messageDropdown}>
                                        <div className={styles.dropdownHeader}>
                                            <h3>Recent Inquiries</h3>
                                            <NavLink to="/admin/messages" onClick={() => setIsMessageDropdownOpen(false)}>
                                                View All
                                            </NavLink>
                                        </div>
                                        <div className={styles.dropdownBody}>
                                            {recentMessages.length > 0 ? (
                                                recentMessages.map(msg => (
                                                    <div 
                                                        key={msg.id} 
                                                        className={`${styles.dropdownItem} ${!msg.isRead ? styles.unread : ''}`}
                                                        onClick={() => handleViewMessage(msg)}
                                                    >
                                                        <div className={styles.itemHeader}>
                                                            <span className={styles.itemName}>{msg.name}</span>
                                                            <span className={styles.itemDate}>
                                                                {new Date(msg.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className={styles.itemSnippet}>{msg.message}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={styles.emptyDropdown}>No messages yet</div>
                                            )}
                                        </div>
                                        <NavLink 
                                            to="/admin/messages" 
                                            className={styles.dropdownFooter}
                                            onClick={() => setIsMessageDropdownOpen(false)}
                                        >
                                            See everything in Inbox
                                        </NavLink>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.userProfile}>
                            <img src="https://i.pravatar.cc/150?img=12" alt="Admin" className={styles.avatar} />
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>Marcus George</span>
                                <span className={styles.userRole}>Admin</span>
                            </div>
                            <BiChevronDown />
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
                                to="/admin/messages" 
                                className={styles.goToInboxBtn}
                                onClick={() => setViewingMessage(null)}
                            >
                                Go to Inbox
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
