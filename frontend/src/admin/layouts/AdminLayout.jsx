import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    BiGridAlt, BiCart, BiPackage, BiUser,
    BiFile, BiPurchaseTag, BiLink, BiHelpCircle,
    BiCog, BiSearch, BiBell, BiMessageDetail, BiChevronDown
} from 'react-icons/bi';
import styles from './AdminLayout.module.css';
import logo from '../../assets/logo.png'; // Updated relative path

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar when navigating on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Request full screen for mobile (optional, but good for admin apps)

    // Mapping paths to titles for the topbar
    const getPageTitle = (pathname) => {
        if (pathname.includes('/admin/orders')) return 'Orders';
        if (pathname.includes('/admin/products')) return 'Products';
        if (pathname.includes('/admin/customers')) return 'Customers';
        if (pathname === '/admin') return 'Dashboard';
        return 'Dashboard';
    };

    const currentTitle = getPageTitle(location.pathname);

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <BiGridAlt />, end: true },
        { name: 'Orders', path: '/admin/orders', icon: <BiCart /> },
        { name: 'Products', path: '/admin/products', icon: <BiPackage /> },
        { name: 'Customers', path: '/admin/customers', icon: <BiUser /> },
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
                        <div className={styles.actionIcon}>
                            <BiMessageDetail />
                        </div>
                        <div className={styles.actionIcon}>
                            <BiBell />
                            <div className={styles.notificationBadge}></div>
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
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
