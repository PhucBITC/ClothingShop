import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa'; // Nhớ cài react-icons nếu chưa có
import styles from './PasswordChanged.module.css';
import bgImage from '../../assets/login_bg.jpg'; // Reusing the login background

const PasswordChanged = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <img src={bgImage} alt="Background" className={styles.bgImage} />
            <div className={styles.overlay}></div>

            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <FaCheckCircle className={styles.icon} />
                </div>

                <h2 className={styles.title}>Password Changed!</h2>
                <p className={styles.message}>
                    Mật khẩu của bạn đã được cập nhật thành công.
                    <br />
                    Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                </p>

                <button
                    className={styles.loginBtn}
                    onClick={() => navigate('/login')}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default PasswordChanged;