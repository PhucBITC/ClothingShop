import React, { useState, useEffect } from 'react';
import { BiPlus, BiPencil, BiTrash, BiPhone, BiCheckCircle } from 'react-icons/bi';
import UserSidebar from './UserSidebar';
import styles from './ManageAddresses.module.css';
import axios from '../../api/axios';
import { useToast } from '../../components/common/toast/ToastContext';
import ConfirmModal from '../../components/common/modal/ConfirmModal';
import { anglicizeAddress } from '../../utils/addressUtils';

function ManageAddresses() {
    const toast = useToast();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, address: null });

    // States for Vietnam Address API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const initialFormData = {
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
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchAddresses();
        fetchProvinces();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error("Error", "Failed to load addresses.");
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await response.json();
            const localized = data.map(p => ({ ...p, name: anglicizeAddress(p.name) }));
            setProvinces(localized);
        } catch (error) {
            console.error("Error fetching provinces:", error);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        if (!provinceCode) return;
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            const localized = data.districts.map(d => ({ ...d, name: anglicizeAddress(d.name) }));
            setDistricts(localized);
            return localized;
        } catch (error) {
            console.error("Error fetching districts:", error);
            return [];
        }
    };

    const fetchWards = async (districtCode) => {
        if (!districtCode) return;
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await response.json();
            const localized = data.wards.map(w => ({ ...w, name: anglicizeAddress(w.name) }));
            setWards(localized);
            return localized;
        } catch (error) {
            console.error("Error fetching wards:", error);
            return [];
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'province') {
            const selectedProvince = provinces.find(p => p.name === value);
            if (selectedProvince) {
                fetchDistricts(selectedProvince.code);
                setFormData(prev => ({ ...prev, district: '', ward: '' }));
                setDistricts([]);
                setWards([]);
            }
        } else if (name === 'district') {
            const selectedDistrict = districts.find(d => d.name === value);
            if (selectedDistrict) {
                fetchWards(selectedDistrict.code);
                setFormData(prev => ({ ...prev, ward: '' }));
                setWards([]);
            }
        }
    };

    const handleOpenAddModal = () => {
        setEditingAddress(null);
        setFormData(initialFormData);
        setShowModal(true);
    };

    const handleOpenEditModal = async (addr) => {
        setEditingAddress(addr);

        // Ensure names are anglicized to match the dropdown options
        const anglicizedProvince = anglicizeAddress(addr.province);
        const anglicizedDistrict = anglicizeAddress(addr.district);
        const anglicizedWard = anglicizeAddress(addr.ward);

        setFormData({
            fullName: addr.fullName,
            phone: addr.phone,
            province: anglicizedProvince,
            district: anglicizedDistrict,
            ward: anglicizedWard,
            streetAddress: addr.streetAddress,
            note: addr.note || '',
            isDefault: addr.default || addr.isDefault,
            latitude: addr.latitude || 0,
            longitude: addr.longitude || 0
        });

        // Pre-fetch districts and wards for the existing address
        try {
            // Find province to get its code
            const province = provinces.find(p => p.name === anglicizedProvince);
            if (province) {
                const fetchedDistricts = await fetchDistricts(province.code);

                // Find district to get its code
                const district = fetchedDistricts.find(d => d.name === anglicizedDistrict);
                if (district) {
                    await fetchWards(district.code);
                }
            }
        } catch (error) {
            console.error("Error pre-populating address levels:", error);
        }

        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await axios.put(`/addresses/${editingAddress.id}`, formData);
                toast.success("Success", "Address updated successfully.");
            } else {
                await axios.post('/addresses', formData);
                toast.success("Success", "Address added successfully.");
            }
            setShowModal(false);
            fetchAddresses();
        } catch (error) {
            toast.error("Error", "Failed to save address.");
        }
    };

    const handleDeleteClick = (addr) => {
        setDeleteModalConfig({ isOpen: true, address: addr });
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/addresses/${deleteModalConfig.address.id}`);
            toast.success("Success", "Address removed.");
            fetchAddresses();
        } catch (error) {
            toast.error("Error", "Failed to delete address.");
        }
        setDeleteModalConfig({ isOpen: false, address: null });
    };

    const handleSetDefault = async (id) => {
        try {
            await axios.patch(`/addresses/${id}/set-default`, {});
            toast.success("Success", "Default address updated.");
            fetchAddresses();
        } catch (error) {
            console.error("Error setting default address:", error);
            toast.error("Error", "Failed to update default address.");
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            <div className={styles.contentWrapper}>
                <UserSidebar />

                <div className={styles.mainContent}>
                    <button className={styles.addNewBtn} onClick={handleOpenAddModal}>
                        <BiPlus /> Add New Address
                    </button>

                    {loading ? (
                        <div className={styles.loading}>Loading addresses...</div>
                    ) : addresses.length === 0 ? (
                        <div className={styles.noAddresses}>No addresses found. Please add one.</div>
                    ) : (
                        <div className={styles.addressList}>
                            {addresses.map((addr) => (
                                <div className={`${styles.addressCard} ${(addr.default || addr.isDefault) ? styles.defaultCard : ''}`}>
                                    <div className={styles.addressInfo}>
                                        <div className={styles.cardHeader}>
                                            <h4>{addr.fullName}</h4>
                                            {(addr.default || addr.isDefault) && <span className={styles.defaultBadge}><BiCheckCircle /> Default</span>}
                                        </div>
                                        <div className={styles.addressText}>
                                            {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                                        </div>
                                        <div className={styles.phoneRow}>
                                            <BiPhone /> {addr.phone}
                                        </div>
                                        {addr.note && <div className={styles.noteText}>Note: {addr.note}</div>}
                                    </div>

                                    <div className={styles.actions}>
                                        <div className={styles.topActions}>
                                            <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => handleOpenEditModal(addr)}>
                                                <BiPencil /> Edit
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteClick(addr)}>
                                                <BiTrash /> Delete
                                            </button>
                                        </div>
                                        {!(addr.default || addr.isDefault) && (
                                            <button className={styles.setDefaultLink} onClick={() => handleSetDefault(addr.id)}>
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalHeader}>{editingAddress ? 'Edit address' : 'Add a new address'}</h3>
                        <form className={styles.modalForm} onSubmit={handleSubmit}>
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
                                    <label className={styles.label}>Street & House Number</label>
                                    <input name="streetAddress" type="text" className={styles.input} required value={formData.streetAddress} onChange={handleInputChange} placeholder="E.g. 123 Le Loi St" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Note (Optional)</label>
                                <textarea name="note" className={styles.input} value={formData.note} onChange={handleInputChange} placeholder="Delivery instructions..."></textarea>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input name="isDefault" type="checkbox" id="manageDefaultAddr" checked={formData.isDefault} onChange={handleInputChange} />
                                <label htmlFor="manageDefaultAddr">Use as my default address</label>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>{editingAddress ? 'Update Address' : 'Add New Address'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalConfig.isOpen}
                onClose={() => setDeleteModalConfig({ isOpen: false, address: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Address"
                message="Are you sure you want to remove this address?"
                itemName={deleteModalConfig.address?.streetAddress}
                confirmText="Delete"
                confirmColor="#ef4444"
            />
        </div>
    );
}

export default ManageAddresses;
