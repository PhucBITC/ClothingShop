import React, { useEffect } from 'react';
import { BiPackage, BiLock, BiUser, BiTrash } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './Notifications.module.css';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../components/common/toast/ToastContext';

function Notifications() {
    const {
        notifications,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useNotifications();
    const toast = useToast();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const renderIcon = (note) => {
        switch (note.type) {
            case 'ORDER': return <BiPackage />;
            case 'SECURITY': return <BiLock />;
            case 'SYSTEM': return <BiUser />;
            default: return <BiUser />;
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        const success = await deleteNotification(id);
        if (success) {
            toast.success("Success", "Notification deleted");
        } else {
            toast.error("Error", "Failed to delete notification");
        }
    };

    const handleDeleteAll = async () => {
        const success = await deleteAllNotifications();
        if (success) {
            toast.success("Success", "All notifications cleared");
        } else {
            toast.error("Error", "Failed to clear notifications");
        }
    };

    if (loading && notifications.length === 0) {
        return <div className={styles.loading}>Loading notifications...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                <UserSidebar />

                <div className={styles.mainContent}>
                    <div className={styles.headerRow}>
                        <h2>Notifications</h2>
                        <div className={styles.headerActions}>
                            {notifications.some(n => !n.isRead) && (
                                <button onClick={markAllAsRead} className={styles.markAllBtn}>
                                    Mark all as read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={handleDeleteAll} className={styles.clearAllBtn}>
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyState}>No notifications yet</div>
                        ) : (
                            notifications.map((note) => (
                                <div
                                    key={note.id}
                                    className={`${styles.notificationItem} ${!note.isRead ? styles.unread : ''}`}
                                    onClick={() => !note.isRead && markAsRead(note.id)}
                                >
                                    <div className={styles.iconWrapper}>
                                        {renderIcon(note)}
                                    </div>
                                    <div className={styles.notifContent}>
                                        <div className={styles.notifTitle}>{note.title}</div>
                                        <div className={styles.notifDesc}>{note.content}</div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <div className={styles.timestamp}>{formatTime(note.createdAt)}</div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => handleDelete(e, note.id)}
                                            title="Delete"
                                        >
                                            <BiTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Notifications;
