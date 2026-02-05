import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Verify-otp.module.css';
import verifyBg from '../../assets/verify_bg.jpg'; // Đảm bảo bạn có ảnh này

const VerifyOtp = () => {
    // Tạo mảng 6 phần tử rỗng để chứa từng số OTP
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
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

                // Lưu token và role vào localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);

                // Điều hướng dựa trên role
                if (data.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
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
        setIsResending(true);
        setResendMessage('');
        setError('');

        try {
            // Delay tối thiểu 2 giây để hiển thị loader
            const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));

            // Gọi lại API forgot-password để gửi lại mã
            const apiCall = fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const [response] = await Promise.all([apiCall, minLoadTime]);

            if (response.ok) {
                setResendMessage("OTP đã được gửi lại!");
                setOtp(new Array(6).fill("")); // Reset ô nhập
                inputRefs.current[0].focus();

                // Tắt thông báo sau 3 giây
                setTimeout(() => {
                    setResendMessage('');
                }, 3000);
            } else {
                setError("Gửi lại thất bại. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error(error);
            setError("Lỗi kết nối Server.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className={styles.otpWrapper}>
            {/* Loader Resend */}
            {isResending && (
                <div className={styles.resendLoaderOverlay}>
                    <div className={styles.svgLoader}>
                        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="4" cy="12" r="3">
                                <animate id="spinner_qFRN" begin="0;spinner_OcgL.end+0.25s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"></animate>
                            </circle>
                            <circle cx="12" cy="12" r="3">
                                <animate begin="spinner_qFRN.begin+0.1s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"></animate>
                            </circle>
                            <circle cx="20" cy="12" r="3">
                                <animate id="spinner_OcgL" begin="spinner_qFRN.begin+0.2s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"></animate>
                            </circle>
                        </svg>
                    </div>
                </div>
            )}

            {/* Notification Success */}
            {resendMessage && (
                <div className={styles.resendNotificationOverlay}>
                    <div className={styles.notificationBox}>
                        {resendMessage.split('').map((char, index) => (
                            <span
                                key={index}
                                className={styles.slideChar}
                                style={{ animationDelay: `${index * 0.03}s` }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </div>
                </div>
            )}

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