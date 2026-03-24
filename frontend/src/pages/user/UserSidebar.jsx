import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BiUser, BiPackage, BiHeart, BiMap, BiCreditCard, BiBell, BiCog } from 'react-icons/bi';
import { useAuth } from '../../context/AuthContext';
import styles from './UserSidebar.module.css';

function UserSidebar() {
    const { user } = useAuth();

    const menuItems = [
        { name: 'Personal Information', path: '/user/profile', icon: <BiUser /> },
        { name: 'My Orders', path: '/user/orders', icon: <BiPackage /> },
        { name: 'My Wishlists', path: '/user/wishlist', icon: <BiHeart /> },
        { name: 'Manage Addresses', path: '/user/addresses', icon: <BiMap /> },
        { name: 'Notifications', path: '/user/notifications', icon: <BiBell /> },
        { name: 'Settings', path: '/user/settings', icon: <BiCog /> },
    ];

    if (!user) return null;

    return (
        <aside className={styles.sidebar}>
            <div className={styles.profileHeader}>
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080/api/files/${user.avatarUrl}`}
                        alt={user.fullName}
                        className={styles.avatar}
                    />
                ) : (
                    <div className={styles.userInitial}>
                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
                <div className={styles.userInfo}>
                    <h5>Hello <span className={styles.wave}>👋</span></h5>
                    <h3>{user.fullName}</h3>
                </div>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default UserSidebar;
