import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    BiGridAlt, BiCart, BiPackage, BiUser,
    BiFile, BiPurchaseTag, BiLink, BiHelpCircle,
    BiCog, BiSearch, BiBell, BiMessageDetail, BiChevronDown
} from 'react-icons/bi';
import styles from './AdminLayout.module.css';
import logo from '../../assets/logo.png'; // Updated relative path

const AdminLayout = () => {
    const location = useLocation();

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
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Logo" className={styles.logo} />
                    {/* <span className={styles.brandName}>EzMart</span> User wants the real logo, text might be in logo */}
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
                    <h1 className={styles.pageTitle}>{currentTitle}</h1>

                    <div className={styles.searchBar}>
                        <BiSearch color="#999" size={20} />
                        <input type="text" placeholder="Search stock, order, etc" className={styles.searchInput} />
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
