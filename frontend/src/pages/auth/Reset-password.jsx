import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Reset-password.module.css';
import resetBg from '../../assets/reset_bg.jpg'; // Bạn nhớ chuẩn bị ảnh này nhé
import PasswordChanged from './PasswordChanged';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    // Lấy token từ URL (ví dụ: http://localhost:5173/reset-password?token=xyz123)
    const token = searchParams.get('token');

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Kiểm tra nếu không có token thì đuổi về trang login
    useEffect(() => {
        if (!token) {
            setError('Đường dẫn không hợp lệ hoặc đã hết hạn.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp!');
            return;
        }

        if (passwords.newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setIsLoading(true);

        try {
            // Gọi API Backend để reset mật khẩu
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
                setIsSuccess(true);
            } else {
                const errData = await response.text();
                setError(errData || 'Đổi mật khẩu thất bại. Token có thể đã hết hạn.');
            }
        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối Server. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return <PasswordChanged />;
    }

    return (
        <div className={styles.resetWrapper}>
            {/* Cột Trái: Ảnh */}
            <div className={styles.resetLeft}>
                <img src={resetBg} alt="Reset Password Background" className={styles.bgImage} />
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>New Beginning</h2>
                    <p className={styles.overlayText}>
                        Tạo một mật khẩu mới mạnh mẽ hơn để bảo vệ tài khoản của bạn.
                    </p>
                </div>
            </div>

            {/* Cột Phải: Form */}
            <div className={styles.resetRight}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>Reset Password</h2>
                    <p className={styles.subtitle}>Enter your new password below.</p>

                    {message && <div className={styles.successMessage}>{message}</div>}
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Mật khẩu mới */}
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

                        {/* Xác nhận mật khẩu */}
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
        </div>
    );
};

export default ResetPassword;