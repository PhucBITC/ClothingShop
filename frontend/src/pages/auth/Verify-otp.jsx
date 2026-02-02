import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Verify-otp.module.css';
import verifyBg from '../../assets/verify_bg.jpg'; // Đảm bảo bạn có ảnh này

const VerifyOtp = () => {
    // Tạo mảng 6 phần tử rỗng để chứa từng số OTP
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Ref để điều khiển việc focus vào các ô input
    const inputRefs = useRef([]);

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
        // Focus vào ô đầu tiên khi trang vừa load
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email, navigate]);

    // Xử lý khi nhập số
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Tự động nhảy sang ô tiếp theo nếu đã nhập số
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Xử lý khi nhấn nút Xóa (Backspace)
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                // Nếu ô hiện tại rỗng, lùi về ô trước đó
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        const otpString = otp.join(""); // Gộp 6 ô thành 1 chuỗi

        if (otpString.length < 6) {
            setError('Vui lòng nhập đủ 6 số OTP.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: otpString }),
            });

            if (response.ok) {
                const data = await response.json();
                // data.token là UUID để reset password
                // Chuyển sang trang Reset Password kèm token trên URL
                navigate(`/reset-password?token=${data.token}`);
            } else {
                const errData = await response.text();
                setError(errData || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
            }
        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối Server.');
        }
    };

    const handleResend = async () => {
        try {
            // Gọi lại API forgot-password để gửi lại mã
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                alert("Mã OTP mới đã được gửi vào email của bạn!");
                setOtp(new Array(6).fill("")); // Reset ô nhập
                inputRefs.current[0].focus();
            } else {
                alert("Gửi lại thất bại. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối Server.");
        }
    };

    return (
        <div className={styles.otpWrapper}>
            {/* Cột Trái: Hình ảnh */}
            <div className={styles.otpLeft}>
                <img src={verifyBg} alt="Verification" className={styles.bgImage} />
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>Security Check</h2>
                    <p className={styles.overlayText}>
                        Bảo mật tài khoản là ưu tiên hàng đầu của chúng tôi.
                    </p>
                </div>
            </div>

            {/* Cột Phải: Form nhập OTP */}
            <div className={styles.otpRight}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>Verification</h2>
                    <p className={styles.subtitle}>
                        Nhập mã 6 số chúng tôi vừa gửi tới:<br />
                        <b>{email}</b>
                    </p>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <form onSubmit={handleVerify}>
                        <div className={styles.otpInputsContainer}>
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        className={styles.otpBox}
                                        type="text"
                                        name="otp"
                                        maxLength="1"
                                        key={index}
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        ref={el => inputRefs.current[index] = el}
                                        onFocus={e => e.target.select()}
                                    />
                                );
                            })}
                        </div>

                        <button type="submit" className={styles.verifyBtn}>
                            Verify Code
                        </button>
                    </form>

                    <div className={styles.resendContainer}>
                        <p>Chưa nhận được mã?</p>
                        <button className={styles.resendBtn} onClick={handleResend}>
                            Gửi lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;