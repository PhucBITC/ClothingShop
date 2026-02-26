import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiCheckCircle,
    HiXCircle,
    HiInformationCircle,
    HiExclamation,
    HiRefresh
} from 'react-icons/hi';
import styles from './Toast.module.css';

const Toast = ({ type = 'info', title, message, duration = 3000, onClose }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (type === 'loading') return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        const progressTimer = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - (100 / (duration / 10))));
        }, 10);

        return () => {
            clearTimeout(timer);
            clearInterval(progressTimer);
        };
    }, [duration, onClose, type]);

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
                        className={styles.progressBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </motion.div>
    );
};

export default Toast;
