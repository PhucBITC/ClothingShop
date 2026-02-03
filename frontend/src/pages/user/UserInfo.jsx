import React from 'react';
import { BiEdit } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './UserInfo.module.css';

function UserInfo() {
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
                            <img src="https://i.pravatar.cc/150?img=11" alt="Robert Fox" className={styles.avatar} />
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
                            <input type="text" className={styles.input} defaultValue="Robert" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Last Name</label>
                            <input type="text" className={styles.input} defaultValue="Fox" />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <input type="text" className={styles.input} defaultValue="(252) 555-0126" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <input type="email" className={styles.input} defaultValue="robertfox@example.com" />
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Address</label>
                            <input type="text" className={styles.input} defaultValue="2464 Royal Ln. Mesa, New Jersey 45463" />
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default UserInfo;
