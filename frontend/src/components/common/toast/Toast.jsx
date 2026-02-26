import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiCheckCircle,
    HiXCircle,
    HiInformationCircle,
    HiExclamation,
    HiRefresh
} from 'react-icons/hi';
import styles from './Toast.module.css';

const Toast = ({ type = 'info', title, message, duration = 3000, onClose }) => {
    useEffect(() => {
        if (type === 'loading') return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [duration, onClose, type, title, message]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <HiCheckCircle className={styles.successIcon} />;
            case 'error': return <HiXCircle className={styles.errorIcon} />;
            case 'warning': return <HiExclamation className={styles.warningIcon} />;
            case 'loading': return <HiRefresh className={`${styles.infoIcon} ${styles.spin}`} />;
            case 'info':
            default: return <HiInformationCircle className={styles.infoIcon} />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className={`${styles.toast} ${styles[type]}`}
        >
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    {getIcon()}
                </div>
                <div className={styles.textWrapper}>
                    {title && <h4 className={styles.title}>{title}</h4>}
                    {message && <p className={styles.message}>{message}</p>}
                </div>
                <button className={styles.closeBtn} onClick={onClose}>
                    <HiXCircle />
                </button>
            </div>

            {type !== 'loading' && (
                <div className={styles.progressBarWrapper}>
                    <div
                        key={`${type}-${title}-${message}`} // Force fresh animation on update
                        className={styles.progressBar}
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            )}
        </motion.div>
    );
};

export default Toast;
