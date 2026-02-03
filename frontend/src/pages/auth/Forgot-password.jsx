import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa'; // Đảm bảo bạn đã cài react-icons
import styles from './Forgot-password.module.css';
import forgotBg from '../../assets/forgot_bg.jpg'; // Bạn nhớ chuẩn bị 1 ảnh đặt tên này nhé

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState(''); // Thông báo thành công
    const [error, setError] = useState('');     // Thông báo lỗi
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);


        try {
            // Delay tối thiểu 2 giây để hiển thị hiệu ứng loader
            const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));

            // Giả định API Backend là /api/auth/forgot-password
            const apiCall = fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const [response] = await Promise.all([apiCall, minLoadTime]);

            if (response.ok) {
                setMessage('Mã OTP đã được gửi đến email của bạn.');
                setTimeout(() => {
                    navigate('/verify-otp', { state: { email: email } });
                }, 1000);
            } else {
                // Xử lý trường hợp email không tồn tại trong hệ thống
                const errData = await response.text();
                setError(errData || 'Không tìm thấy email này trong hệ thống.');
            }
        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối Server. Vui lòng thử lại sau.');
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

            {/* Cột Trái: Hình ảnh */}
            <div className={styles.forgotLeft}>
                <img src={forgotBg} alt="Forgot Password Background" className={styles.bgImage} />
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>Don't Worry!</h2>
                    <p className={styles.overlayText}>
                        Chuyện quên mật khẩu xảy ra với tất cả mọi người. Chúng tôi sẽ giúp bạn lấy lại nó ngay thôi.
                    </p>
                </div>
            </div>

            {/* Cột Phải: Form */}
            <div className={styles.forgotRight}>
                <div className={styles.formContainer}>
                    {/* Nút quay lại Login */}
                    <Link to="/login" className={styles.backLink}>
                        <FaArrowLeft /> Back to Login
                    </Link>

                    <h2 className={styles.title}>Forgot Password?</h2>
                    <p className={styles.subtitle}>
                        Enter your email address to get the password reset link.
                    </p>

                    {/* Khu vực hiển thị thông báo */}
                    {message && <div className={styles.successMessage}>{message}</div>}
                    {error && <div className={styles.errorMessage}>{error}</div>}

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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Password Reset'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;