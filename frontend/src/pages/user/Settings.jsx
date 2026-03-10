import React, { useState, useEffect } from 'react';
import UserSidebar from './UserSidebar';
import styles from './Settings.module.css';
import { useToast } from '../../components/common/toast/ToastContext';
import axios from '../../api/axios';

function Settings() {
    const toast = useToast();
    const [toggles, setToggles] = useState(() => {
        const saved = localStorage.getItem('userSettings');
        return saved ? JSON.parse(saved) : {
            appearance: 'Light',
            language: 'English',
            twoFactor: false,
            pushNotif: true,
            desktopNotif: true,
            emailNotif: true
        };
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(toggles));
        document.documentElement.setAttribute('data-theme', toggles.appearance);
    }, [toggles]);

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success('Updated', `Successfully updated ${key} preference`);
    };

    const handleChange = (key, value) => {
        setToggles(prev => ({ ...prev, [key]: value }));
        toast.info('Updated', `Theme changed to ${value}`);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Error', 'Confirm password does not match');
            return;
        }
        try {
            await axios.put('/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Success', 'Password updated successfully');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Error', error.response?.data || 'Failed to update password');
        }
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
                            <select
                                className={styles.selectInput}
                                value={toggles.appearance}
                                onChange={(e) => handleChange('appearance', e.target.value)}
                            >
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
                            <select
                                className={styles.selectInput}
                                value={toggles.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                            >
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

                        {/* Security Section */}
                        <div className={styles.sectionDivider}>
                            <h2 className={styles.sectionTitle}>Security</h2>
                            <p className={styles.sectionSubtitle}>Manage your account safety</p>
                        </div>

                        <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
                            <div className={styles.formGroup}>
                                <label>Old Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button type="submit" className={styles.saveBtn}>Update Password</button>
                        </form>

                        {/* Account Section */}
                        <div className={styles.sectionDivider}>
                            <h2 className={styles.sectionTitle}>Account</h2>
                            <p className={styles.sectionSubtitle}>Account status and deletion</p>
                        </div>

                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingTitle} style={{ color: '#e53e3e' }}>Delete Account</div>
                                <div className={styles.settingDesc}>Once you delete your account, there is no going back. Please be certain.</div>
                            </div>
                            <button className={styles.deleteBtn}>Delete</button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Settings;
