import React, { useState, useRef, useEffect } from 'react';
import { BiUser, BiPhone, BiEnvelope, BiCamera, BiSave, BiX, BiLockAlt, BiKey } from 'react-icons/bi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/toast/ToastContext';
import axios from '../../api/axios';
import styles from './AdminProfile.module.css';

const AdminProfile = () => {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [editForm, setEditForm] = useState({
        fullName: '',
        phoneNumber: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setEditForm({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    if (!user) return <div className={styles.loading}>Loading...</div>;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('user', new Blob([JSON.stringify(editForm)], { type: 'application/json' }));
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await axios.put('/auth/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await refreshUser();
            setAvatarFile(null);
            setPreviewImage(null);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data || "Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Confirm password does not match");
            return;
        }

        setIsLoading(true);
        try {
            await axios.put('/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            toast.success("Password updated successfully");
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(error.response?.data || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEditForm({
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || ''
        });
        setPreviewImage(null);
        setAvatarFile(null);
    };

    const getAvatarSrc = () => {
        if (previewImage) return previewImage;
        if (!user.avatarUrl) return null;
        if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
        return `http://localhost:8080/api/files/${user.avatarUrl}`;
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Profile</h1>
                <p className={styles.subtitle}>Manage your account information and security settings</p>
            </div>

            <div className={styles.profileGrid}>
                {/* Left side: Avatar and Info Summary */}
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.photoSection}>
                            <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                                {getAvatarSrc() ? (
                                    <img src={getAvatarSrc()} alt="Profile" className={styles.avatar} />
                                ) : (
                                    <div className={styles.userInitial}>
                                        {user.fullName?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                )}
                                <div className={styles.cameraOverlay}>
                                    <BiCamera />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>
                            <h2>{user.fullName}</h2>
                            <p className={styles.subtitle}>{user.email}</p>
                            <span className={styles.roleBadge}>{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Forms */}
                <div className={styles.rightCol}>
                    <div className={styles.card}>
                        {/* Profile Info Form */}
                        <form onSubmit={handleSaveProfile}>
                            <h3 className={styles.formSectionTitle}><BiUser /> Personal Information</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        name="fullName"
                                        value={editForm.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Phone Number</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        name="phoneNumber"
                                        value={editForm.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Email Address (Login ID)</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        value={user.email}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.cancelBtn}`}
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    <BiX /> Reset
                                </button>
                                <button
                                    type="submit"
                                    className={`${styles.btn} ${styles.saveBtn}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : <><BiSave /> Save Profile</>}
                                </button>
                            </div>
                        </form>

                        <div className={styles.divider} style={{ margin: '40px 0' }} />

                        {/* Password Change Form */}
                        <form onSubmit={handlePasswordChange}>
                            <h3 className={styles.formSectionTitle}><BiLockAlt /> Security & Password</h3>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Current Password</label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>New Password</label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    type="submit"
                                    className={`${styles.btn} ${styles.saveBtn}`}
                                    disabled={isLoading}
                                >
                                    <BiKey /> Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
