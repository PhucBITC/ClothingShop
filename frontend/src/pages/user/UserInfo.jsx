import React from 'react';
import { BiEdit } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import { useAuth } from '../../context/AuthContext';
import styles from './UserInfo.module.css';

function UserInfo() {
    const { user } = useAuth();

    if (!user) return null;

    const firstName = user.fullName?.split(' ')[0] || '';
    const lastName = user.fullName?.split(' ').slice(1).join(' ') || '';

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Personal Info */}
                <div className={styles.mainContent}>

                    <div className={styles.profileHeaderSection}>
                        <div className={styles.avatarWrapper}>
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
                            <div className={styles.editAvatarBtn}>
                                <BiEdit />
                            </div>
                        </div>
                        <button className={styles.editProfileBtn}>
                            <BiEdit /> Edit Profile
                        </button>
                    </div>

                    <form className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>First Name</label>
                            <input type="text" className={styles.input} defaultValue={firstName} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Last Name</label>
                            <input type="text" className={styles.input} defaultValue={lastName} readOnly />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input type="text" className={styles.input} defaultValue={user.phoneNumber || 'Not provided'} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <input type="email" className={styles.input} defaultValue={user.email} readOnly />
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Address</label>
                            <input type="text" className={styles.input} defaultValue="Address management in separate tab" readOnly />
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default UserInfo;
