import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiX, BiTargetLock, BiDollar } from 'react-icons/bi';
import styles from './TargetModal.module.css';

const TargetModal = ({ isOpen, onClose, onSave, currentTarget }) => {
    const [target, setTarget] = useState(currentTarget);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTarget(currentTarget);
        }
    }, [isOpen, currentTarget]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!target || isNaN(target) || target <= 0) {
            alert('Please enter a valid target amount.');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(parseFloat(target));
            onClose();
        } catch (error) {
            console.error('Error saving target:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={onClose}>
                    <motion.div 
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <div className={styles.titleGroup}>
                                <div className={styles.iconWrapper}>
                                    <BiTargetLock />
                                </div>
                                <div>
                                    <h2 className={styles.title}>Monthly Target</h2>
                                    <p className={styles.subtitle}>Set your revenue goals for this month</p>
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <BiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.modalBody}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Target Revenue ($)</label>
                                <div className={styles.inputWrapper}>
                                    <BiDollar className={styles.inputIcon} />
                                    <input 
                                        type="number"
                                        className={styles.input}
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        placeholder="e.g. 10000"
                                        autoFocus
                                    />
                                </div>
                                <p className={styles.helperText}>Calculated from the 1st of each month.</p>
                            </div>

                            <div className={styles.actions}>
                                <button 
                                    type="button" 
                                    className={styles.cancelBtn} 
                                    onClick={onClose}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.saveBtn}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Updating...' : 'Update Target'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TargetModal;
