import React from 'react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>{title}</h3>
                <p className={styles.modalMessage}>
                    {message} {itemName && <span className={styles.itemName}>{itemName}</span>}?
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
