import React, { useState } from 'react';
import { BiPlus, BiPencil, BiTrash, BiPhone } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './ManageAddresses.module.css';

function ManageAddresses() {
    const [showModal, setShowModal] = useState(false);
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

                    <button className={styles.addNewBtn} onClick={() => setShowModal(true)}>
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

            {/* Add Address Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalHeader}>Add a new address</h3>
                        <form className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Name</label>
                                <input type="text" className={styles.input} placeholder="Enter Name" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Mobile Number</label>
                                <input type="text" className={styles.input} placeholder="Enter Mobile Number" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Flat, House no., Building, Company, Apartment</label>
                                <input type="text" className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Area, Colony, Street, Sector, Village</label>
                                <input type="text" className={styles.input} />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>City</label>
                                <select className={styles.select}>
                                    <option>Select City</option>
                                    <option>New York</option>
                                    <option>Los Angeles</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Pin Code</label>
                                <input type="text" className={styles.input} placeholder="Enter Pin Code" />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>State</label>
                                <select className={styles.select}>
                                    <option>Select State</option>
                                    <option>California</option>
                                    <option>New York</option>
                                </select>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input type="checkbox" id="defaultAddr" />
                                <label htmlFor="defaultAddr">Use as my default address</label>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="button" className={styles.submitBtn} onClick={() => setShowModal(false)}>Add New Address</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAddresses;
