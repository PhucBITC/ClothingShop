import React, { useState, useEffect } from 'react';
import UserSidebar from './UserSidebar';
import styles from './Settings.module.css';
import { useToast } from '../../components/common/toast/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

function Settings() {
    const toast = useToast();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [toggles, setToggles] = useState(() => {
        const saved = localStorage.getItem('userSettings');
        return saved ? JSON.parse(saved) : {
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
    }, [toggles]);

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success('Updated', `Successfully updated ${key} preference`);
    };

    const handleChange = (key, value) => {
        if (key === 'appearance') {
            setTheme(value);
        }
        toast.info('Updated', `${key} changed to ${value}`);
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

            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

        } catch (error) {
            toast.error('Error', error.response?.data || 'Failed to update password');
        }
    };

    const confirmDeleteAccount = async () => {
        try {
            await axios.delete('/auth/delete-account');
            toast.success('Success', 'Account deleted successfully');
            logout();
            navigate('/');
        } catch (error) {
            toast.error('Error', error.response?.data || 'Failed to delete account');
        } finally {
            setShowDeleteModal(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.deleteModalContent}>
                        <h2 className={styles.deleteModalTitle}>Confirm Delete</h2>
                        <p className={styles.deleteModalText}>
                            Are you sure you want to delete <strong>{user?.fullName || 'this account'}</strong>?
                        </p>
                        <div className={styles.deleteModalActions}>
                            <button 
                                className={styles.cancelModalBtn} 
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className={styles.confirmModalBtn} 
                                onClick={confirmDeleteAccount}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>

                <UserSidebar />

                <div className={styles.mainContent}>

                    <div className={styles.settingsList}>

                        {/* Appearance */}
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingTitle}>Appearance</div>
                                <div className={styles.settingDesc}>
                                    Customize how your theme looks on your device
                                </div>
                            </div>

                            <select
                                className={styles.selectInput}
                                value={theme}
                                onChange={(e) => handleChange('appearance', e.target.value)}
                            >
                                <option value="Light">Light</option>
                                <option value="Dark">Dark</option>
                            </select>
                        </div>

                        {/* Security Section */}
                        <div className={styles.sectionDivider}>
                            <h2 className={styles.sectionTitle}>Security</h2>
                            <p className={styles.sectionSubtitle}>
                                Manage your account safety
                            </p>
                        </div>

                        <form onSubmit={handlePasswordChange} className={styles.passwordForm}>

                            <div className={styles.formGroup}>
                                <label>Old Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            oldPassword: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <button type="submit" className={styles.saveBtn}>
                                Update Password
                            </button>

                        </form>

                        {/* Account Section */}
                        <div className={styles.sectionDivider}>
                            <h2 className={styles.sectionTitle}>Account</h2>
                            <p className={styles.sectionSubtitle}>
                                Account status and deletion
                            </p>
                        </div>

                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div
                                    className={styles.settingTitle}
                                    style={{ color: '#e53e3e' }}
                                >
                                    Delete Account
                                </div>

                                <div className={styles.settingDesc}>
                                    Once you delete your account, there is no going back.
                                    Please be certain.
                                </div>
                            </div>

                            <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Settings;