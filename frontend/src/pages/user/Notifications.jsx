import React from 'react';
import { BiPackage, BiLock, BiUser } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './Notifications.module.css';

function Notifications() {
    const notifications = [
        {
            id: 1,
            title: 'Profile Update',
            desc: 'You just update your profile picture',
            time: 'Just Now',
            type: 'profile_image',
            image: 'https://i.pravatar.cc/150?img=11'
        },
        {
            id: 2,
            title: 'Your order placed successfully',
            desc: 'You place a new order',
            time: '11:16 AM',
            type: 'order'
        },
        {
            id: 3,
            title: 'Order delivered',
            desc: 'Your order has been delivered successfully',
            time: '09:00 AM',
            type: 'delivery'
        },
        {
            id: 4,
            title: 'You share your feedback',
            desc: '“It was an amazing experience with your company”',
            time: 'Yesterday',
            type: 'review',
            image: 'https://i.pravatar.cc/150?img=11'
        },
        {
            id: 5,
            title: 'Password Update successfully',
            desc: 'Your password has been updated successfully',
            time: 'Yesterday',
            type: 'security'
        }
    ];

    const renderIcon = (note) => {
        if (note.image) {
            return <img src={note.image} alt="User" className={styles.avatarIcon} />;
        }
        switch (note.type) {
            case 'order': return <BiPackage />;
            case 'delivery': return <BiPackage />; // Or a different check icon
            case 'security': return <BiLock />;
            default: return <BiUser />;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Notifications */}
                <div className={styles.mainContent}>

                    <div className={styles.notificationList}>
                        {notifications.map((note) => (
                            <div key={note.id} className={styles.notificationItem}>
                                <div className={styles.iconWrapper}>
                                    {renderIcon(note)}
                                </div>
                                <div className={styles.notifContent}>
                                    <div className={styles.notifTitle}>{note.title}</div>
                                    <div className={styles.notifDesc}>{note.desc}</div>
                                </div>
                                <div className={styles.timestamp}>{note.time}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Notifications;
