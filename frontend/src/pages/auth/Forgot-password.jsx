import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { useToast } from '../../components/common/toast/ToastContext';
import styles from './Forgot-password.module.css';
import forgotBg from '../../assets/forgot_bg.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    React.useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);


        try {
            // Minimum delay of 2 seconds for loader effect
            const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));

            // Backend API call
            const apiCall = fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const [response] = await Promise.all([apiCall, minLoadTime]);

            if (response.ok) {
                toast.success("Success", 'OTP code has been sent to your email.');
                setResendTimer(60); // Start 60s cooldown
                setTimeout(() => {
                    navigate('/verify-otp', { state: { email: email, mode: 'forgot-password' } });
                }, 1000);
            } else {
                // Handle case where email is not in system
                const errData = await response.text();
                toast.error("Error", errData || 'Email not found in our system.');
            }
        } catch (err) {
            console.error(err);
            toast.error("Error", 'Server connection error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.forgotWrapper}>
            {/* Loader Overlay */}
            {isLoading && (
                <div className={styles.loaderOverlay}>
                    <div className={styles.loaderContainer}>
                        <span className={styles.loaderDot}></span>
                        <span className={`${styles.loaderDot} ${styles.delay1}`}></span>
                        <span className={`${styles.loaderDot} ${styles.delay2}`}></span>
                    </div>
                </div>
            )}

            {/* Left Column: Image */}
            <div className={styles.forgotLeft}>
                <img src={forgotBg} alt="Forgot Password Background" className={styles.bgImage} />
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>Don't Worry!</h2>
                    <p className={styles.overlayText}>
                        Forgetting passwords happens to everyone. We'll help you recover it in no time.
                    </p>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className={styles.forgotRight}>
                <div className={styles.formContainer}>
                    {/* Back to login button */}
                    <Link to="/login" className={styles.backLink}>
                        <FaArrowLeft /> Back to Login
                    </Link>

                    <h2 className={styles.title}>Forgot Password?</h2>
                    <p className={styles.subtitle}>
                        Enter your email address to get the password reset link.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email Address</label>
                            <div className={styles.inputWrapper}>
                                <FaEnvelope className={styles.inputIcon} />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="hello@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={styles.inputField}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading || resendTimer > 0}
                        >
                            {isLoading ? 'Sending...' : (resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Password Reset')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;