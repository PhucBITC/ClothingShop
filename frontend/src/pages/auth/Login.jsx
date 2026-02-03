import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Đảm bảo đã cài axios
import styles from './Login.module.css'; // Import CSS Modules
import loginBg from '../../assets/login_bg.jpg'; // Đường dẫn đến ảnh nền

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Để hiển thị lỗi từ server


  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Delay tối thiểu 2 giây để hiển thị hiệu ứng loader
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));

      const apiCall = axios.post('http://localhost:8080/api/auth/login', {
        email: email,
        password: password
      });

      // Chạy song song API call và delay
      const [response] = await Promise.all([apiCall, minLoadTime]);

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      } else {
        setIsLoading(false);
        setError('Đăng nhập thất bại: Không nhận được token.');
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

  return (
    <div className={styles.loginWrapper}>
      {/* Loader Overlay */}
      {isLoading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderContainer}>
            <div className={`${styles.loaderDot} ${styles.dot1}`}></div>
            <div className={`${styles.loaderDot} ${styles.dot2}`}></div>
            <div className={`${styles.loaderDot} ${styles.dot3}`}></div>
            <div className={`${styles.loaderDot} ${styles.dot4}`}></div>
          </div>
        </div>
      )}

      {/* Success Message Overlay */}


      {/* Phần bên trái: Hình ảnh */}
      <div className={styles.loginLeft}>
        <img src={loginBg} alt="Fashion Model" className={styles.backgroundImage} />
        {/* Có thể thêm logo Krist và text overlay ở đây nếu muốn */}
        <div className={styles.overlayContent}>
          <img src="/logo-krist.svg" alt="Krist Logo" className={styles.kristLogo} /> {/* Thay bằng logo của bạn */}
          <h2 className={styles.welcomeText}>Welcome Back!</h2>
          <p className={styles.tagline}>Khám phá phong cách thời trang độc đáo.</p>
        </div>
      </div>

      {/* Phần bên phải: Form đăng nhập */}
      <div className={styles.loginRight}>
        <div className={styles.formContainer}>
          <h1 className={styles.formTitle}>Welcome 👋</h1>
          <p className={styles.formSubtitle}>Please login here</p>

          {error && <div className={styles.errorMessage}>{error}</div>} {/* Hiển thị lỗi */}

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
              <input
                type="email"
                id="email"
                className={styles.inputField}
                placeholder="robertfox@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>Password</label>
              <input
                type="password"
                id="password"
                className={styles.inputField}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.optionsGroup}>
              <div className={styles.rememberMe}>
                <input type="checkbox" id="rememberMe" className={styles.checkbox} disabled={isLoading} />
                <label htmlFor="rememberMe" className={styles.checkboxLabel}>Remember Me</label>
              </div>
              <Link to="/forgot-password" className={styles.forgotPassword}>Forgot Password?</Link>
            </div>

            <button type="submit" className={styles.loginButton} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Login'}
            </button>
          </form>

          <p className={styles.registerLink}>
            Don't have an account? <Link to="/register">Register Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;