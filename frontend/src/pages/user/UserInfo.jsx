import React, { useState, useRef } from 'react';
import { BiEdit, BiSave, BiX, BiCamera } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/toast/ToastContext';
import axios from '../../api/axios';
import styles from './UserInfo.module.css';

function UserInfo() {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [editForm, setEditForm] = useState({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || ''
    });

    if (!user) return null;

    const firstName = isEditing ? editForm.fullName.split(' ')[0] : (user.fullName?.split(' ')[0] || '');
    const lastName = isEditing ? editForm.fullName.split(' ').slice(1).join(' ') : (user.fullName?.split(' ').slice(1).join(' ') || '');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'firstName' || name === 'lastName') {
            const currentFirstName = name === 'firstName' ? value : firstName;
            const currentLastName = name === 'lastName' ? value : lastName;
            setEditForm(prev => ({
                ...prev,
                fullName: `${currentFirstName} ${currentLastName}`.trim()
            }));
        } else {
            setEditForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
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

    const handleSave = async () => {
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
            setIsEditing(false);
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

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || ''
        });
        setPreviewImage(null);
        setAvatarFile(null);
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Personal Info */}
                <div className={styles.mainContent}>

                    <div className={styles.profileHeaderSection}>
                        <div className={`${styles.avatarWrapper} ${isEditing ? styles.editableAvatar : ''}`} onClick={handleAvatarClick}>
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className={styles.avatar} />
                            ) : user.avatarUrl ? (
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
                            {isEditing && (
                                <div className={styles.cameraOverlay}>
                                    <BiCamera />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </div>

                        {!isEditing ? (
                            <button className={styles.editProfileBtn} onClick={() => setIsEditing(true)}>
                                <BiEdit /> Edit Profile
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button className={styles.cancelActionBtn} onClick={handleCancel} disabled={isLoading}>
                                    <BiX /> Cancel
                                </button>
                                <button className={styles.saveActionBtn} onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? 'Saving...' : <><BiSave /> Save Changes</>}
                                </button>
                            </div>
                        )}
                    </div>

                    <form className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>First Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                name="firstName"
                                value={firstName}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Last Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                name="lastName"
                                value={lastName}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
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
                                readOnly={!isEditing}
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <input type="email" className={styles.input} defaultValue={user.email} readOnly />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Subscription Tier</label>
                            <div className={styles.tierBadge}>
                                {user.subscriptionTier || 'FREE'}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>AI Try-On Credits</label>
                            <div className={styles.creditValue}>
                                {user.purchasedCredits || 0} credits
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default UserInfo;
