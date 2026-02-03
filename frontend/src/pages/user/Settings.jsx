import React, { useState } from 'react';
import UserSidebar from './UserSidebar';
import styles from './Settings.module.css';

function Settings() {
    // Mock States
    const [toggles, setToggles] = useState({
        twoFactor: true,
        pushNotif: true,
        desktopNotif: true,
        emailNotif: true
    });

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Settings */}
                <div className={styles.mainContent}>

                    <div className={styles.settingsList}>

                        {/* Appearance */}
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingTitle}>Appearance</div>
                                <div className={styles.settingDesc}>Customize how your theme looks on your device</div>
                            </div>
                            <select className={styles.selectInput} defaultValue="Light">
                                <option value="Light">Light</option>
                                <option value="Dark">Dark</option>
                            </select>
                        </div>

                        {/* Language */}
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingTitle}>Language</div>
                                <div className={styles.settingDesc}>Select your language</div>
                            </div>
                            <select className={styles.selectInput} defaultValue="English">
                                <option value="English">English</option>
                                <option value="French">French</option>
                                <option value="Spanish">Spanish</option>
                            </select>
                        </div>

                        {/* Two-factor Authentication */}
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingTitle}>Two-factor Authentication</div>
                                <div className={styles.settingDesc}>Keep your account secure by enabling 2FA via mail</div>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={toggles.twoFactor}
                                    onChange={() => handleToggle('twoFactor')}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        {/* Push Notifications */}
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingTitle}>Push Notifications</div>
                                <div className={styles.settingDesc}>Receive push notification</div>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={toggles.pushNotif}
                                    onChange={() => handleToggle('pushNotif')}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        {/* Desktop Notification */}
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingTitle}>Desktop Notification</div>
                                <div className={styles.settingDesc}>Receive push notification in desktop</div>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={toggles.desktopNotif}
                                    onChange={() => handleToggle('desktopNotif')}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        {/* Email Notifications */}
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingTitle}>Email Notifications</div>
                                <div className={styles.settingDesc}>Receive email notification</div>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={toggles.emailNotif}
                                    onChange={() => handleToggle('emailNotif')}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Settings;
