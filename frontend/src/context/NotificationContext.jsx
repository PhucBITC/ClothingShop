import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const response = await axios.get('/notifications/unread-count');
            setUnreadCount(response.data);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    }, [user]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data);
            // After fetching the list, update unread count just in case
            const unread = response.data.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            const response = await axios.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Update unread count if the deleted notification was unread
            const deletedNote = notifications.find(n => n.id === id);
            if (deletedNote && !deletedNote.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            return true;
        } catch (error) {
            console.error("Error deleting notification:", error);
            return false;
        }
    };

    const deleteAllNotifications = async () => {
        try {
            await axios.delete('/notifications/all');
            setNotifications([]);
            setUnreadCount(0);
            return true;
        } catch (error) {
            console.error("Error deleting all notifications:", error);
            return false;
        }
    };

    // Poll for new notifications every 60 seconds if logged in
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            fetchNotifications(); // Add this to populate notifications on load/refresh
            const interval = setInterval(() => {
                fetchUnreadCount();
                // Optionally update notifications too if we want real-time list
                // fetchNotifications(); 
            }, 60000);
            return () => clearInterval(interval);
        } else {
            setUnreadCount(0);
            setNotifications([]);
        }
    }, [user, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            notifications,
            loading,
            fetchNotifications,
            fetchUnreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            deleteAllNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
