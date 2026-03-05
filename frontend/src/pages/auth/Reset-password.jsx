import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import styles from './Reset-password.module.css';
import { useToast } from '../../components/common/toast/ToastContext';
import resetBg from '../../assets/reset_bg.jpg';
import PasswordChanged from './PasswordChanged';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    // Get token from URL
    const token = searchParams.get('token');

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // If no token, return to login
    useEffect(() => {
        if (!token) {
            toast.error("Error", 'Invalid or expired reset link.');
        }
    }, [token]);

    // Auto redirect after success
    useEffect(() => {
        let timer;
        if (isSuccess) {
            timer = setTimeout(() => {
                navigate('/login');
            }, 3000); // Redirect after 3s
        }
        return () => clearTimeout(timer);
    }, [isSuccess, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Error", 'Passwords do not match!');
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Error", 'Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);

        try {
            // Call Backend API to reset password
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: passwords.newPassword
                }),
            });

            if (response.ok) {
                // Only one notification (toast) as requested
                toast.success("Success", "Password updated successfully!");
                setIsSuccess(true);
            } else {
                const errData = await response.text();
                toast.error("Error", errData || 'Password reset failed. Token may have expired.');
            }
        } catch (err) {
            console.error(err);
            toast.error("Error", 'Server connection error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Removed logic that returns PasswordChanged component entirely

    return (
        <div className={styles.resetWrapper}>
            {/* Left Column: Image */}
            <div className={styles.resetLeft}>
                <img src={resetBg} alt="Reset Password Background" className={styles.bgImage} />
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>New Beginning</h2>
                    <p className={styles.overlayText}>
                        Create a new, stronger password to protect your account.
                    </p>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className={styles.resetRight}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>Reset Password</h2>
                    <p className={styles.subtitle}>Enter your new password below.</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* New Password */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="newPassword">New Password</label>
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    placeholder="••••••••"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    required
                                    className={styles.inputField}
                                    disabled={!token}
                                />
                                <button
                                    type="button"
                                    className={styles.toggleBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    required
                                    className={styles.inputField}
                                    disabled={!token}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading || !token}
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Success Overlay integrated directly */}
            {isSuccess && (
                <div className={styles.successOverlay}>
                    <div className={styles.successContent}>
                        <div className={styles.successIconWrapper}>
                            <FaCheck />
                        </div>
                        <h3 className={styles.successTitle}>Password Changed!</h3>
                        <p className={styles.successText}>
                            Your password has been updated successfully.
                            Returning to login screen...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;