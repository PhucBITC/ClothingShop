import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/toast/ToastContext';
import styles from './Login.module.css';
import loginBg from '../../assets/login_bg.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for 2FA
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Ref to control input focus
  const inputRefs = useRef([]);

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus on first OTP input when shown
  useEffect(() => {
    if (showOtpInput && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0].focus(), 100);
    }
  }, [showOtpInput]);

  // Handle OTP digit change
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto jump to next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace in OTP boxes
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Return to previous box if current is empty
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      const apiCall = axios.post('http://localhost:8080/api/auth/login', {
        email: email,
        password: password
      });

      const [response] = await Promise.all([apiCall, minLoadTime]);
      if (response.data) {
        if (response.data.require2fa) {
          setIsLoading(false);
          setShowOtpInput(true);
          toast.info("Verification Required", "Please check your email for the 2FA code.");
        } else if (response.data.token) {
          login(response.data.token, response.data.role);
          if (response.data.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } else {
        setIsLoading(false);
        toast.error("Login Failed", 'Invalid response from server.');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        toast.error("Login Failed", err.response.data.message || 'Invalid email or password!');
      } else {
        toast.error("Error", 'An error occurred while connecting to the server.');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      const otpString = otp.join("");
      const apiCall = axios.post('http://localhost:8080/api/auth/verify-login', {
        email: email,
        otp: otpString
      });

      const [response] = await Promise.all([apiCall, minLoadTime]);

      if (response.data && response.data.token) {
        toast.success("Welcome", "Sign in successful!");
        login(response.data.token, response.data.role);
        if (response.data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setIsLoading(false);
        toast.error("Verification Failed", 'Invalid response.');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Verify OTP error:', err);
      if (err.response && err.response.data) {
        toast.error("Error", err.response.data || 'Invalid or expired OTP code.');
      } else {
        toast.error("Error", 'An error occurred.');
      }
    }
  };
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: email,
        password: password
      });
      if (response.data && response.data.require2fa) {
        toast.success("Resent", "Verification code has been resent to your email.");
        setResendTimer(60);
      }
    } catch (err) {
      console.error('Resend error:', err);
      const errMsg = err.response?.data?.message || err.response?.data || 'Resend failed.';
      toast.error("Error", errMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {/* Loader Overlay */}
      {isLoading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderContainer}>
            <div className={styles.squareLoader}>
              <div className={styles.squareDot} style={{ top: 0, left: 0, animationDuration: '1.2s' }}></div>
              <div className={styles.squareDot} style={{ top: 0, right: 0, animationDuration: '1.2s', animationDelay: '0.15s' }}></div>
              <div className={styles.squareDot} style={{ bottom: 0, right: 0, animationDuration: '1.2s', animationDelay: '0.3s' }}></div>
              <div className={styles.squareDot} style={{ bottom: 0, left: 0, animationDuration: '1.2s', animationDelay: '0.45s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Left Column - Image */}
      <div className={styles.loginLeft}>
        <img src={loginBg} alt="Login Background" className={styles.backgroundImage} />
        <div className={styles.overlayContent}>
          <h2 className={styles.welcomeText}>Welcome to our community</h2>
          <p className={styles.tagline}>A place where fashion meets elegance.</p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className={styles.loginRight}>
        <div className={styles.loginContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Enter your email below to sign in to your account</p>
          </div>

          <form onSubmit={showOtpInput ? handleVerifyOtp : handleLogin} className={styles.formGrid}>

            {showOtpInput ? (
              // OTP Input Form
              <div className={styles.inputGroup}>
                <p className={styles.subtitle} style={{ marginBottom: '1rem', color: '#2c3e50' }}>
                  A verification code (OTP) has been sent to your email.
                </p>
                <label className={styles.label}>Enter OTP Code</label>

                <div className={styles.otpInputsContainer}>
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className={styles.otpBox}
                      value={data}
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading}
                  style={{ marginTop: '1.5rem' }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className={styles.submitBtn}
                  style={{ marginTop: '0.5rem', backgroundColor: '#95a5a6' }}
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp(new Array(6).fill('')); // Clear OTP on back
                  }}
                  disabled={isLoading}
                >
                  Back
                </button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isResending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendTimer > 0 ? '#95a5a6' : '#3498db',
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline'
                    }}
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                  </button>
                </div>
              </div>
            ) : (
              // Normal Login Form
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="email">Email</label>
                  <input
                    className={styles.input}
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.passwordWrapper}>
                    <label className={styles.label} htmlFor="password">Password</label>
                    <a href="/forgot-password" className={styles.forgotPassword}>Forgot your password?</a>
                  </div>
                  <div className={styles.passwordWrapper}>
                    <input
                      className={styles.input}
                      id="password"
                      placeholder="*********"
                      type={passwordVisible ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={togglePassword}
                      tabIndex="-1"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  Sign In
                </button>
              </>
            )}
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

          <p className={styles.footer}>
            Don't have an account?{" "}
            <a href="/register" className={styles.signUpLink}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;