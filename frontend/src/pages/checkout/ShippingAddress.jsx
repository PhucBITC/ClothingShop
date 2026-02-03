import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiHome, BiCreditCard, BiListCheck, BiCheckSquare, BiSquare, BiEdit, BiTrash } from 'react-icons/bi';
import styles from './ShippingAddress.module.css';

function ShippingAddress() {
    const navigate = useNavigate();
    const [selectedAddress, setSelectedAddress] = useState(1);

    const addresses = [
        {
            id: 1,
            name: 'Robert Fox',
            address: '4517 Washington Ave. Manchester, Kentucky 39495',
            checked: true
        },
        {
            id: 2,
            name: 'John Willions',
            address: '3891 Ranchview Dr. Richardson, California 62639',
            checked: false
        }
    ];

    // Mock calculations
    const subtotal = 200.00;
    const delivery = 5.00;
    const total = 205.00;

    return (
        <div className={styles.checkoutContainer}>
            <h1 className={styles.pageTitle}>Shipping Address</h1>

            {/* Timeline */}
            <div className={styles.timeline}>
                <div className={`${ styles.step } ${ styles.active } `}>
                    <div className={styles.stepIcon}><BiHome /></div>
                    <span className={styles.stepLabel}>Address</span>
                </div>
                <div className={styles.step}>
                    <div className={styles.stepIcon}><BiCreditCard /></div>
                    <span className={styles.stepLabel}>Payment Method</span>
                </div>
                <div className={styles.step}>
                    <div className={styles.stepIcon}><BiListCheck /></div>
                    <span className={styles.stepLabel}>Review</span>
                </div>
            </div>

            <div className={styles.contentWrapper}>

                {/* Left Column: Address Selection & Form */}
                <div className={styles.leftColumn}>

                    <h3 className={styles.sectionHeader}>Select a delivery address</h3>
                    <p className={styles.subText}>Is the address you'd like to use displayed below? If so, click the corresponding "Deliver to this address" button. Or you can enter a new delivery address.</p>

                    <div className={styles.addressGrid}>
                        {addresses.map(addr => (
                            <div
                                key={addr.id}
                                className={`${ styles.addressCard } ${ selectedAddress === addr.id ? styles.selected : '' } `}
                                onClick={() => setSelectedAddress(addr.id)}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.name}>{addr.name}</span>
                                    <div className={styles.checkbox}>
                                        {selectedAddress === addr.id ? <BiCheckSquare /> : <BiSquare />}
                                    </div>
                                </div>
                                <p className={styles.addressText}>{addr.address}</p>
                                <div className={styles.cardActions}>
                                    <button className={styles.actionBtn}><BiEdit /> Edit</button>
                                    <button className={`${ styles.actionBtn } ${ styles.delete } `}><BiTrash /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className={styles.deliverBtn}>Deliver Here</button>

                    <div className={styles.addAddressSection}>
                        <h3 className={styles.sectionHeader}>Add a new address</h3>
                        <form className={styles.addressForm}>
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
                                <select className={styles.input}>
                                    <option>Select City</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Pin Code</label>
                                <input type="text" className={styles.input} placeholder="Enter Pin Code" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>State</label>
                                <select className={styles.input}>
                                    <option>Select State</option>
                                </select>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input type="checkbox" id="defaultAddr" />
                                <label htmlFor="defaultAddr">Use as my default address</label>
                            </div>

                            <button type="button" className={styles.addNewBtn}>Add New Address</button>
                        </form>
                    </div>

                </div>

                {/* Right Column: Summary */}
                <div className={styles.summaryColumn}>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Subtotal</span>
                        <span style={{ fontWeight: '700' }}>${subtotal.toFixed(2)}</span>
                    </div>

                    <div className={styles.discountGroup}>
                        <input type="text" placeholder="Enter Discount Code" className={styles.discountInput} defaultValue="FLAT50" />
                        <button className={styles.applyBtn}>Apply</button>
                    </div>

                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Delivery Charge</span>
                        <span style={{ fontWeight: '700' }}>${delivery.toFixed(2)}</span>
                    </div>

                    <div className={styles.grandTotal}>
                        <span>Grand Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ShippingAddress;
