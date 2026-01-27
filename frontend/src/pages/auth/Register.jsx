import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css'; // Import CSS Module
import registerBg from '../../assets/register_bg.jpg'; // Bạn nhớ kiếm 1 cái ảnh đặt tên này nhé

const Register = () => {
    // State lưu trữ dữ liệu nhập vào
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Hàm xử lý khi nhập liệu
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    // Hàm xử lý khi bấm Đăng Ký
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Kiểm tra mật khẩu nhập lại có khớp không
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp!');
            return;
        }

        try {
            // 2. Gọi API Backend (Java Spring Boot)
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password
                    // Không cần gửi confirmPassword lên server
                }),
            });

            // 3. Xử lý kết quả trả về
            if (response.ok) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login'); // Chuyển hướng sang trang đăng nhập
            } else {
                // Nếu server trả về lỗi (ví dụ: Email đã tồn tại)
                const errorData = await response.text();
                setError(errorData || 'Đăng ký thất bại. Vui lòng thử lại.');
            }

        } catch (err) {
            console.error("Lỗi kết nối:", err);
            setError('Không thể kết nối đến server. Hãy kiểm tra lại backend.');
        }
    };

    return (
        <div className={styles.registerWrapper}>
            {/* Cột Trái: Hình Ảnh */}
            <div className={styles.registerLeft}>
                <img src={registerBg} alt="Register Background" className={styles.bgImage} />
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>Join Us Today!</h2>
                    <p className={styles.overlayText}>
                        Tạo tài khoản để nhận ưu đãi độc quyền và theo dõi đơn hàng dễ dàng hơn.
                    </p>
                </div>
            </div>

            {/* Cột Phải: Form Đăng Ký */}
            <div className={styles.registerRight}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>Create Account</h2>
                    <p className={styles.subtitle}>Sign up to get started</p>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <form onSubmit={handleRegister}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="fullName">Full Name</label>
                            <input 
                                type="text" 
                                id="fullName" 
                                placeholder="Nguyen Van A"
                                value={formData.fullName}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Register
                        </button>
                    </form>

                    <p className={styles.loginLink}>
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;