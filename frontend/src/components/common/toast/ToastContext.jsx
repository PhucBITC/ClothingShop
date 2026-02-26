import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toastData) => {
        // Use provided ID or generate a unique one
        const id = toastData.id || (Date.now() + Math.random());

        setToasts((prev) => {
            const exists = prev.find(t => t.id === id);
            if (exists) {
                // Update existing toast
                return prev.map(t => t.id === id ? { ...t, ...toastData, id } : t);
            }
            // Add new toast
            return [...prev, { ...toastData, id }];
        });

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (title, message, options = {}) =>
            addToast({ type: 'success', title, message, ...options }),
        error: (title, message, options = {}) =>
            addToast({ type: 'error', title, message, ...options }),
        info: (title, message, options = {}) =>
            addToast({ type: 'info', title, message, ...options }),
        warning: (title, message, options = {}) =>
            addToast({ type: 'warning', title, message, ...options }),
        loading: (title, message, options = {}) =>
            addToast({ type: 'loading', title, message, ...options }),
        remove: (id) => removeToast(id)
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    pointerEvents: 'none'
                }}
            >
                <AnimatePresence>
                    {toasts.map((t) => (
                        <Toast
                            key={t.id}
                            {...t}
                            onClose={() => removeToast(t.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
