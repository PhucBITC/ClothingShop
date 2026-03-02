import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BiUser, BiPackage, BiHeart, BiMap, BiCreditCard, BiBell, BiCog } from 'react-icons/bi';
import { useAuth } from '../../context/AuthContext';
import styles from './UserSidebar.module.css';

function UserSidebar() {
    const location = useLocation();
    const { user } = useAuth();
    const currentPath = location.pathname;

    const menuItems = [
        { name: 'Personal Information', path: '/user/profile', icon: <BiUser /> },
        { name: 'My Orders', path: '/user/orders', icon: <BiPackage /> },
        { name: 'My Wishlists', path: '/user/wishlist', icon: <BiHeart /> },
        { name: 'Manage Addresses', path: '/user/addresses', icon: <BiMap /> },
        { name: 'Saved Cards', path: '/user/saved-cards', icon: <BiCreditCard /> },
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
                <ul className={styles.naxList}>
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                to={item.path}
                                className={`${styles.navItem} ${currentPath === item.path ? styles.active : ''}`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default UserSidebar;
