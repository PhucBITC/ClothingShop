import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';
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
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp!');
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

            if (response.ok) {
                // Có thể hiển thị thông báo đẹp hơn thay vì alert
                // alert('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');
            } else {
                const errorData = await response.text();
                setError(errorData || 'Đăng ký thất bại. Vui lòng thử lại.');
            }

        } catch (err) {
            console.error("Lỗi kết nối:", err);
            setError('Không thể kết nối đến server.');
        }
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
                        <h1 className={styles.title}>Create an account</h1>
                        <p className={styles.subtitle}>Enter your details below to create your account</p>
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

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
                        <button type="button" className={styles.socialBtn}>
                            <div className={styles.socialIcon}><FaGoogle /></div> Google
                        </button>
                        <button type="button" className={styles.socialBtn}>
                            <div className={styles.socialIcon}><FaFacebook /></div> Facebook
                        </button>
                    </div>

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