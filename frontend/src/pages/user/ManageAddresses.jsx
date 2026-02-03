import React from 'react';
import { BiPlus, BiPencil, BiTrash, BiPhone } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './ManageAddresses.module.css';

function ManageAddresses() {
    const addresses = [
        {
            id: 1,
            name: 'Robert Fox',
            address: '4517 Washington Ave. Manchester, Kentucky 39495',
            phone: '(209) 555-0104'
        },
        {
            id: 2,
            name: 'John Willions',
            address: '3891 Ranchview Dr. Richardson, California 62639',
            phone: '(270) 555-0117'
        },
        {
            id: 3,
            name: 'Alexa Johnson',
            address: '4517 Washington Ave. Manchester, Kentucky 39495',
            phone: '(208) 555-0112'
        }
    ];

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                {/* Sidebar Navigation */}
                <UserSidebar />

                {/* Main Content: Addresses */}
                <div className={styles.mainContent}>

                    <button className={styles.addNewBtn}>
                        <BiPlus /> Add New Address
                    </button>

                    <div className={styles.addressList}>
                        {addresses.map((addr) => (
                            <div key={addr.id} className={styles.addressCard}>
                                <div className={styles.addressInfo}>
                                    <h4>{addr.name}</h4>
                                    <div className={styles.addressText}>{addr.address}</div>
                                    <div className={styles.phoneRow}>
                                        <BiPhone /> {addr.phone}
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button className={`${styles.actionBtn} ${styles.editBtn}`}>
                                        <BiPencil /> Edit
                                    </button>
                                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                                        <BiTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ManageAddresses;
