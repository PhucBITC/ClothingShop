import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import styles from './Login.module.css';
import loginBg from '../../assets/login_bg.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for 2FA
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
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
          setError('');
          // Có thể hiển thị thông báo "OTP đã gửi" nếu muốn
        } else if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/');
        }
      } else {
        setIsLoading(false);
        setError('Đăng nhập thất bại: Không nhận được phản hồi hợp lệ.');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Lỗi đăng nhập:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Email hoặc mật khẩu không đúng!');
      } else {
        setError('Có lỗi xảy ra khi kết nối đến server.');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      const apiCall = axios.post('http://localhost:8080/api/auth/verify-login', {
        email: email,
        otp: otp
      });

      const [response] = await Promise.all([apiCall, minLoadTime]);

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      } else {
        setIsLoading(false);
        setError('Xác thực thất bại.');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Lỗi verify OTP:', err);
      if (err.response && err.response.data) {
        setError(err.response.data || 'Mã OTP không chính xác hoặc đã hết hạn.');
      } else {
        setError('Có lỗi xảy ra.');
      }
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
            {error && <div className={styles.errorMessage}>{error}</div>}

            {showOtpInput ? (
              // OTP Input Form
              <div className={styles.inputGroup}>
                <p className={styles.subtitle} style={{ marginBottom: '1rem', color: '#2c3e50' }}>
                  Mã xác thực (OTP) đã được gửi đến email của bạn.
                </p>
                <label className={styles.label} htmlFor="otp">Nhập mã OTP</label>
                <input
                  className={styles.input}
                  id="otp"
                  placeholder="Nhập 6 số OTP"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isLoading}
                  style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem' }}
                />
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading}
                  style={{ marginTop: '1.5rem' }}
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  className={styles.submitBtn}
                  style={{ marginTop: '0.5rem', backgroundColor: '#95a5a6' }}
                  onClick={() => setShowOtpInput(false)}
                  disabled={isLoading}
                >
                  Quay lại
                </button>
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