import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiHome, BiCreditCard, BiListCheck, BiCheckSquare, BiSquare, BiTrash } from 'react-icons/bi';
import axios from '../../api/axios';
import { useToast } from '../../components/common/toast/ToastContext';
import styles from './ShippingAddress.module.css';

function ShippingAddress() {
    const navigate = useNavigate();
    const toast = useToast();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(true);

    // States for Vietnam Address API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        note: '',
        isDefault: false,
        latitude: 0,
        longitude: 0
    });

    useEffect(() => {
        fetchAddresses();
        fetchProvinces();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get('/addresses');
            setAddresses(response.data);
            const defaultAddr = response.data.find(a => a.default);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            } else if (response.data.length > 0) {
                setSelectedAddressId(response.data[0].id);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    // Vietnam Address API Functions
    const fetchProvinces = async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await response.json();
            setProvinces(data);
        } catch (error) {
            console.error("Error fetching provinces:", error);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        if (!provinceCode) return;
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    };

    const fetchWards = async (districtCode) => {
        if (!districtCode) return;
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await response.json();
            setWards(data.wards);
        } catch (error) {
            console.error("Error fetching wards:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Handle cascading logic
        if (name === 'province') {
            const selectedProvince = provinces.find(p => p.name === value);
            if (selectedProvince) {
                fetchDistricts(selectedProvince.code);
                setFormData(prev => ({ ...prev, district: '', ward: '' }));
                setDistricts([]);
                setWards([]);
            } else {
                setDistricts([]);
                setWards([]);
                setFormData(prev => ({ ...prev, district: '', ward: '' }));
            }
        } else if (name === 'district') {
            const selectedDistrict = districts.find(d => d.name === value);
            if (selectedDistrict) {
                fetchWards(selectedDistrict.code);
                setFormData(prev => ({ ...prev, ward: '' }));
                setWards([]);
            } else {
                setWards([]);
                setFormData(prev => ({ ...prev, ward: '' }));
            }
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/addresses', formData);
            toast.success("Success", "New address added.");
            setFormData({
                fullName: '', phone: '', province: '', district: '', ward: '',
                streetAddress: '', note: '', isDefault: false,
                latitude: 0, longitude: 0
            });
            fetchAddresses();
        } catch (error) {
            toast.error("Error", "Failed to add address.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/addresses/${id}`);
            toast.success("Success", "Address deleted.");
            fetchAddresses();
        } catch (error) {
            toast.error("Error", "Failed to delete address.");
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await axios.patch(`/addresses/${id}/set-default`);
            toast.success("Success", "Default address updated.");
            fetchAddresses();
        } catch (error) {
            toast.error("Error", "Failed to update default address.");
        }
    };

    const subtotal = 200.00;
    const delivery = 5.00;
    const total = subtotal + delivery;

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.checkoutContainer}>
            <h1 className={styles.pageTitle}>Shipping Address</h1>

            <div className={styles.timeline}>
                <div className={`${styles.step} ${styles.active}`}>
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
                <div className={styles.leftColumn}>
                    <h3 className={styles.sectionHeader}>Select a delivery address</h3>
                    <div className={styles.addressGrid}>
                        {addresses.map(addr => (
                            <div
                                key={addr.id}
                                className={`${styles.addressCard} ${selectedAddressId === addr.id ? styles.selected : ''}`}
                                onClick={() => setSelectedAddressId(addr.id)}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.name}>{addr.fullName}</span>
                                    <div className={styles.checkbox}>
                                        {selectedAddressId === addr.id ? <BiCheckSquare /> : <BiSquare />}
                                    </div>
                                </div>
                                <p className={styles.phoneText}>{addr.phone}</p>
                                <p className={styles.addressText}>
                                    {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                                </p>
                                <div className={styles.cardActions}>
                                    {!addr.default && (
                                        <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}>
                                            Set Default
                                        </button>
                                    )}
                                    <button className={`${styles.actionBtn} ${styles.delete}`} onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}>
                                        <BiTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {addresses.length > 0 && (
                        <button className={styles.deliverBtn} onClick={() => navigate('/checkout/payment', { state: { addressId: selectedAddressId } })}>
                            Deliver Here
                        </button>
                    )}

                    <div className={styles.addAddressSection}>
                        <h3 className={styles.sectionHeader}>Add a new address</h3>
                        <form className={styles.addressForm} onSubmit={handleAddAddress}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input name="fullName" type="text" className={styles.input} required value={formData.fullName} onChange={handleInputChange} placeholder="E.g. John Doe" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Mobile Number</label>
                                    <input name="phone" type="text" className={styles.input} required value={formData.phone} onChange={handleInputChange} placeholder="E.g. 0123456789" />
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Province / City</label>
                                    <select name="province" className={styles.input} required value={formData.province} onChange={handleInputChange}>
                                        <option value="">-- Select Province --</option>
                                        {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>District</label>
                                    <select name="district" className={styles.input} required value={formData.district} onChange={handleInputChange} disabled={!formData.province}>
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Ward</label>
                                    <select name="ward" className={styles.input} required value={formData.ward} onChange={handleInputChange} disabled={!formData.district}>
                                        <option value="">-- Select Ward --</option>
                                        {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Street Address & House Number</label>
                                    <input name="streetAddress" type="text" className={styles.input} required value={formData.streetAddress} onChange={handleInputChange} placeholder="E.g. 123 Le Loi St" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Note (Optional)</label>
                                <textarea name="note" className={styles.input} value={formData.note} onChange={handleInputChange} placeholder="Provide any delivery instructions..."></textarea>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input name="isDefault" type="checkbox" id="defaultAddr" checked={formData.isDefault} onChange={handleInputChange} />
                                <label htmlFor="defaultAddr">Use as my default address</label>
                            </div>

                            <button type="submit" className={styles.addNewBtn}>Add New Address</button>
                        </form>
                    </div>
                </div>

                <div className={styles.summaryColumn}>
                    <div className={styles.summaryContent}>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Delivery Charge</span>
                            <span>${delivery.toFixed(2)}</span>
                        </div>
                        <div className={styles.grandTotal}>
                            <span>Grand Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShippingAddress;
