import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';
import { useToast } from '../../components/common/toast/ToastContext';
import styles from './Register.module.css';
import registerBg from '../../assets/register_bg.jpg';

const FloatingLabelInput = ({ id, type, value, onChange, placeholder, icon, rightIcon, onRightIconClick }) => {
    return (
        <div className={styles.inputGroup}>
            <div className={styles.inputIcon}>{icon}</div>
            <input
                id={id}
                type={type}
                className={`${styles.input} ${rightIcon ? styles.inputWithRightIcon : ''}`}
                value={value}
                onChange={onChange}
                placeholder=" "
                required
            />
            <label htmlFor={id} className={styles.floatingLabel}>
                {placeholder}
            </label>
            {rightIcon && (
                <button
                    type="button"
                    className={styles.rightIconBtn}
                    onClick={onRightIconClick}
                    tabIndex="-1"
                >
                    {rightIcon}
                </button>
            )}
        </div>
    );
};

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Error", 'Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.text();
            if (response.ok) {
                setIsOtpStep(true);
                toast.success("Success", 'Verification code sent to your email.');
                startTimer();
            } else {
                toast.error("Registration Failed", data || 'Please try again.');
            }

        } catch (err) {
            console.error("Connection error:", err);
            toast.error("Network Error", 'Could not connect to the server.');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/verify-register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    otp: otp
                }),
            });

            const data = await response.text();
            if (response.ok) {
                // Success! Redirect to login
                toast.success("Success", "Account verified successfully!");
                navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
            } else {
                toast.error("Verification Failed", data || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            toast.error("Network Error", 'Could not connect to the server.');
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        try {
            const response = await fetch('http://localhost:8080/api/auth/resend-register-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.text();
            if (response.ok) {
                toast.success("Resent", 'A new code has been sent.');
                startTimer();
            } else {
                toast.error("Failed", data || 'Failed to resend OTP.');
            }
        } catch (err) {
            toast.error("Network Error", 'Could not connect to the server.');
        }
    };

    const startTimer = () => {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className={styles.registerWrapper}>
            {/* Left Column - Image */}
            <div className={styles.registerLeft}>
                <img src={registerBg} alt="Register Background" className={styles.bgImage} />
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>Join Us Today!</h2>
                    <p className={styles.overlayText}>
                        Create an account to unlock exclusive offers and track your orders easily.
                    </p>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className={styles.registerRight}>
                <div className={styles.registerContainer}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{isOtpStep ? 'Verify Your Email' : 'Create an Account'}</h1>
                        <p className={styles.subtitle}>
                            {isOtpStep
                                ? `We've sent a 6-digit code to ${formData.email}`
                                : 'Enter your details below to create your account'}
                        </p>
                    </div>

                    {isOtpStep ? (
                        <>
                            <form onSubmit={handleVerify} className={styles.formGrid}>
                                <FloatingLabelInput
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    icon={<FaLock />}
                                />

                                <button type="submit" className={styles.submitBtn}>
                                    Verify Account
                                </button>
                            </form>

                            <div className={styles.resendContainer}>
                                <button
                                    type="button"
                                    className={styles.resendBtn}
                                    onClick={handleResend}
                                    disabled={resendTimer > 0}
                                >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <form onSubmit={handleRegister} className={styles.formGrid}>
                                <FloatingLabelInput
                                    id="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    icon={<FaUser />}
                                />

                                <FloatingLabelInput
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    icon={<FaEnvelope />}
                                />

                                <FloatingLabelInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    icon={<FaLock />}
                                    rightIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
                                    onRightIconClick={() => setShowPassword(!showPassword)}
                                />

                                <FloatingLabelInput
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    icon={<FaLock />}
                                    rightIcon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                />

                                <button type="submit" className={styles.submitBtn}>
                                    Create Account
                                </button>
                            </form>

                            <div className={styles.dividerContainer}>
                                <div className={styles.dividerLine}>
                                    <span className={styles.dividerSpan}></span>
                                </div>
                                <div className={styles.dividerTextWrapper}>
                                    <span className={styles.dividerText}>Or continue with</span>
                                </div>
                            </div>

                            <div className={styles.socialGrid}>
                                <button
                                    type="button"
                                    className={styles.socialBtn}
                                    onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                                >
                                    <FaGoogle /> Google
                                </button>
                                <button
                                    type="button"
                                    className={styles.socialBtn}
                                    onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/facebook'}
                                >
                                    <FaFacebook /> Facebook
                                </button>
                            </div>
                        </>
                    )}

                    <div className={styles.footer}>
                        Already have an account?{' '}
                        <Link to="/login" className={styles.loginLink}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;