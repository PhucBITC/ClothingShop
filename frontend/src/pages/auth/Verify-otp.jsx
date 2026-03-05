import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/toast/ToastContext';
import styles from './Verify-otp.module.css';
import verifyBg from '../../assets/verify_bg.jpg';

const VerifyOtp = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const toast = useToast();

    // Ref to control input focus
    const inputRefs = useRef([]);

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
        // Focus on first input on load
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email, navigate]);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Handle number input
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Auto jump to next input
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle Backspace
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                // Return to previous box if current is empty
                inputRefs.current[index - 1].focus();
            }
        }
    };
    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");

        if (otpString.length < 6) {
            toast.error("Error", 'Please enter all 6 OTP digits.');
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

                if (location.state?.mode === 'forgot-password') {
                    navigate(`/reset-password?token=${otpString}`);
                } else {
                    login(data.token, data.role);
                    if (data.role === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                }
            } else {
                const errData = await response.text();
                toast.error("Error", errData || 'Invalid or expired OTP code.');
            }
        } catch (err) {
            console.error(err);
            toast.error("Error", 'Server connection error.');
        }
    };

    const handleResend = async () => {
        setIsResending(true);

        try {
            // Minimum delay of 2 seconds for loader
            const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));

            // Call forgot-password API to resend
            const apiCall = fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const [response] = await Promise.all([apiCall, minLoadTime]);

            if (response.ok) {
                toast.success("Resent", "OTP has been resent!");
                setOtp(new Array(6).fill("")); // Reset inputs
                setResendTimer(60); // Start 60s cooldown
                inputRefs.current[0].focus();
            } else {
                const errData = await response.text();
                toast.error("Error", errData || "Resend failed. Please try again later.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error", "Server connection error.");
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

            <div className={styles.overlay}></div>

            {/* Left Column: Image */}
            <div className={styles.otpLeft}>
                <img src={verifyBg} alt="Verification" className={styles.bgImage} />
                <div className={styles.overlayContent}>
                    <h2 className={styles.overlayTitle}>Security Check</h2>
                    <p className={styles.overlayText}>
                        Account security is our top priority.
                    </p>
                </div>
            </div>

            {/* Right Column: OTP Input Form */}
            <div className={styles.otpRight}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>Verification</h2>
                    <p className={styles.subtitle}>
                        <b>{email}</b>
                    </p>

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
                        <p>Didn't receive the code?</p>
                        <button
                            className={styles.resendBtn}
                            onClick={handleResend}
                            disabled={isResending || resendTimer > 0}
                        >
                            {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;