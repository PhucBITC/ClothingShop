import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import {
    BiMap,
    BiTrash,
    BiCheckCircle,
    BiXCircle,
    BiChevronDown,
    BiChevronUp,
    BiPlus,
    BiEdit,
    BiX,
    BiUser,
    BiTime,
    BiRefresh
} from 'react-icons/bi';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './CustomerList.module.css';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedUser, setExpandedUser] = useState(null);
    const [addresses, setAddresses] = useState({});
    const toast = useToast();

    // Modal & Form State for Addresses
    const [showModal, setShowModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '', phone: '', province: '', district: '', ward: '',
        streetAddress: '', note: '', isDefault: false
    });

    // Modal & Form State for Users
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [userFormData, setUserFormData] = useState({
        fullName: '', email: '', phoneNumber: '', password: '', role: 'CUSTOMER', status: 'ACTIVE'
    });

    // Custom Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Delete',
        type: 'danger' // danger, warning
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        fetchCustomers();
        fetchProvinces();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/admin/users');
            setCustomers(res.data);
        } catch (e) {
            toast.error("Error", "Failed to load customers.");
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await res.json();
            setProvinces(data);
        } catch (e) {
            console.error("Fetch provinces error:", e);
        }
    };

    const fetchDistricts = async (pCode) => {
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`);
            const data = await res.json();
            setDistricts(data.districts || []);
        } catch (e) {
            console.error("Fetch districts error:", e);
        }
    };

    const fetchWards = async (dCode) => {
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`);
            const data = await res.json();
            setWards(data.wards || []);
        } catch (e) {
            console.error("Fetch wards error:", e);
        }
    };

    const toggleAddresses = async (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
            return;
        }
        setExpandedUser(userId);
        refreshAddresses(userId);
    };

    const refreshAddresses = async (userId) => {
        try {
            const res = await axios.get(`/addresses/user/${userId}`);
            setAddresses(prev => ({ ...prev, [userId]: res.data }));
        } catch (e) {
            toast.error("Error", "Failed to load addresses.");
        }
    };

    const getFileUrl = (filename) => {
        if (!filename) return null;
        return `http://localhost:8080/api/files/${filename}`;
    };

    // --- User CRUD ---
    const handleOpenUserModal = (user = null) => {
        setAvatarFile(null);
        if (user) {
            setEditingUser(user);
            setAvatarPreview(user.avatarUrl ? getFileUrl(user.avatarUrl) : null);
            setUserFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                password: '',
                role: user.role || 'CUSTOMER',
                status: user.status || 'ACTIVE'
            });
        } else {
            setEditingUser(null);
            setAvatarPreview(null);
            setUserFormData({
                fullName: '', email: '', phoneNumber: '', password: '', role: 'CUSTOMER', status: 'ACTIVE'
            });
        }
        setShowUserModal(true);
    };

    const handleUserInputChange = (e) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append('user', new Blob([JSON.stringify(userFormData)], { type: 'application/json' }));
            if (avatarFile) {
                payload.append('avatar', avatarFile);
            }

            if (editingUser) {
                await axios.put(`/admin/users/${editingUser.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Success", "User updated.");
            } else {
                if (!userFormData.password) {
                    toast.error("Error", "Password is required for new users.");
                    return;
                }
                await axios.post('/admin/users', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Success", "User created.");
            }
            setShowUserModal(false);
            fetchCustomers();
        } catch (err) {
            toast.error("Error", err.response?.data || "Failed to save user.");
        }
    };

    // --- Address CRUD ---
    const handleOpenAddressModal = (userId, address = null) => {
        setCurrentUserId(userId);
        if (address) {
            setEditingAddress(address);
            setFormData({
                fullName: address.fullName || '',
                phone: address.phone || '',
                province: address.province || '',
                district: address.district || '',
                ward: address.ward || '',
                streetAddress: address.streetAddress || '',
                note: address.note || '',
                isDefault: address.default || address.isDefault || false
            });
            // Prime provinces/districts/wards
            const p = provinces.find(x => x.name === address.province);
            if (p) fetchDistricts(p.code).then(() => {
                // Districts loaded, now fetch wards if possible
                // (This is tricky async, but usually enough for simple modal open)
            });
        } else {
            setEditingAddress(null);
            setFormData({
                fullName: '', phone: '', province: '', district: '', ward: '',
                streetAddress: '', note: '', isDefault: false
            });
        }
        setShowModal(true);
    };

    const handleAddressInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));

        if (name === 'province') {
            const p = provinces.find(x => x.name === value);
            if (p) fetchDistricts(p.code);
            setDistricts([]); setWards([]);
            setFormData(prev => ({ ...prev, district: '', ward: '' }));
        } else if (name === 'district') {
            const d = districts.find(x => x.name === value);
            if (d) fetchWards(d.code);
            setWards([]);
            setFormData(prev => ({ ...prev, ward: '' }));
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await axios.put(`/addresses/admin/user/${currentUserId}/address/${editingAddress.id}`, formData);
                toast.success("Success", "Address updated.");
            } else {
                await axios.post(`/addresses/admin/user/${currentUserId}`, formData);
                toast.success("Success", "Address added.");
            }
            setShowModal(false);
            refreshAddresses(currentUserId);
        } catch (err) {
            toast.error("Error", "Failed to save address.");
        }
    };

    // --- Confirmation Logic ---
    const confirmDeleteAddress = (userId, addressId) => {
        setConfirmModal({
            show: true,
            title: 'Delete Address',
            message: 'Are you sure you want to remove this shipping address?',
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await axios.delete(`/addresses/admin/${addressId}`);
                    toast.success("Success", "Address deleted.");
                    refreshAddresses(userId);
                } catch (err) {
                    toast.error("Error", "Failed to delete address.");
                }
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    const confirmDeleteUser = (userId) => {
        setConfirmModal({
            show: true,
            title: 'Delete Customer',
            message: 'Caution! This will permanently remove this customer and all their associated data. This action cannot be undone.',
            confirmText: 'Delete Permanently',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await axios.delete(`/admin/users/${userId}`);
                    toast.success("Success", "Customer deleted.");
                    fetchCustomers();
                } catch (err) {
                    toast.error("Error", "Failed to delete customer.");
                }
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    const handleRestoreUser = async (userId) => {
        try {
            await axios.put(`/admin/users/${userId}/restore`);
            toast.success("Success", "Account restored successfully.");
            fetchCustomers();
        } catch (err) {
            toast.error("Error", err.response?.data || "Failed to restore account.");
        }
    };

    if (loading && customers.length === 0) return <div className={styles.loading}>Loading customers...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Customer Management</h2>
                <button className={styles.addAddressBtn} onClick={() => handleOpenUserModal()}>
                    <BiPlus /> Create Customer
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(user => (
                            <React.Fragment key={user.id}>
                                <tr>
                                    <td className={styles.userInfo}>
                                        <div className={styles.avatar}>
                                            {user.avatarUrl ?
                                                <img src={getFileUrl(user.avatarUrl)} alt="" /> :
                                                user.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className={styles.userName}>{user.fullName}</div>
                                            <small style={{ color: '#64748b' }}>ID: #{user.id}</small>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td><span className={styles.roleBadge}>{user.role}</span></td>
                                    <td>
                                        {user.status === 'ACTIVE' && <span className={styles.statusActive}><BiCheckCircle /> Active</span>}
                                        {user.status === 'INACTIVE' && <span className={styles.statusInactive}><BiXCircle /> Inactive</span>}
                                        {user.status === 'DELETED' && <span className={styles.statusDeleted}><BiTrash /> Deleted</span>}
                                        {user.status === 'RESTORE_PENDING' && <span className={styles.statusRestorePending}><BiTime /> Restore Pending</span>}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.addressBtn} onClick={() => toggleAddresses(user.id)}>
                                                <BiMap /> Addresses
                                                {expandedUser === user.id ? <BiChevronUp /> : <BiChevronDown />}
                                            </button>
                                            <button className={styles.addressBtn} onClick={() => handleOpenUserModal(user)}>
                                                <BiEdit /> Edit
                                            </button>
                                            {(user.status === 'DELETED' || user.status === 'RESTORE_PENDING') ? (
                                                <button className={styles.restoreBtn} onClick={() => handleRestoreUser(user.id)}>
                                                    <BiRefresh size={16} /> Restore
                                                </button>
                                            ) : (
                                                <button className={styles.deleteBtn} onClick={() => confirmDeleteUser(user.id)}>
                                                    <BiTrash />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedUser === user.id && (
                                    <tr className={styles.addressRow}>
                                        <td colSpan="5">
                                            <div className={styles.addressContainer}>
                                                <h4><BiMap /> Shipping Addresses</h4>
                                                {addresses[user.id]?.length > 0 ? (
                                                    <div className={styles.addressGrid}>
                                                        {addresses[user.id].map(addr => (
                                                            <div key={addr.id} className={styles.addressCard}>
                                                                <div className={styles.cardHeader}>
                                                                    <strong>{addr.fullName}</strong>
                                                                    {(addr.default || addr.isDefault) && <span className={styles.defaultLabel}>Default</span>}
                                                                </div>
                                                                <p>{addr.phone}</p>
                                                                <p>{addr.streetAddress}, {addr.ward}</p>
                                                                <p>{addr.district}, {addr.province}</p>
                                                                <div className={styles.cardActions}>
                                                                    <button onClick={() => handleOpenAddressModal(user.id, addr)}><BiEdit /> Edit</button>
                                                                    <button className={styles.remove} onClick={() => confirmDeleteAddress(user.id, addr.id)}><BiTrash /> Remove</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '12px 0' }}>No addresses found for this customer.</p>}
                                                <button className={styles.addAddressBtn} onClick={() => handleOpenAddressModal(user.id)}>
                                                    <BiPlus /> Add New Address
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {customers.length === 0 && !loading && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No customers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{editingUser ? 'Edit Customer' : 'Create New Customer'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowUserModal(false)}><BiX /></button>
                        </div>
                        <form className={styles.addressForm} onSubmit={handleSaveUser}>
                            <div className={styles.avatarUploadSection}>
                                <div className={styles.avatarPreviewLarge}>
                                    {avatarPreview ? <img src={avatarPreview} alt="Preview" /> : <div className={styles.avatarPlaceholder}><BiPlus /></div>}
                                </div>
                                <div className={styles.uploadInfo}>
                                    <label className={styles.uploadBtn}>
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                                        Upload Avatar
                                    </label>
                                    <p>Select a profile picture for the customer.<br />Formats: JPG, PNG, WEBP.</p>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input name="fullName" className={styles.input} required value={userFormData.fullName} onChange={handleUserInputChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input name="email" type="email" className={styles.input} required value={userFormData.email} onChange={handleUserInputChange} />
                                </div>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input name="phoneNumber" className={styles.input} value={userFormData.phoneNumber} onChange={handleUserInputChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Password {editingUser && '(Leave blank to keep current)'}</label>
                                    <input name="password" type="password" className={styles.input} required={!editingUser} value={userFormData.password} onChange={handleUserInputChange} />
                                </div>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Role</label>
                                    <select name="role" className={styles.input} value={userFormData.role} onChange={handleUserInputChange}>
                                        <option value="CUSTOMER">CUSTOMER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Status</label>
                                    <select name="status" className={styles.input} value={userFormData.status} onChange={handleUserInputChange}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowUserModal(false)}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}>Save Customer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Address Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}><BiX /></button>
                        </div>
                        <form className={styles.addressForm} onSubmit={handleSaveAddress}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input name="fullName" className={styles.input} required value={formData.fullName} onChange={handleAddressInputChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Phone</label>
                                    <input name="phone" className={styles.input} required value={formData.phone} onChange={handleAddressInputChange} />
                                </div>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Province</label>
                                    <select name="province" className={styles.input} required value={formData.province} onChange={handleAddressInputChange}>
                                        <option value="">-- Select Province --</option>
                                        {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>District</label>
                                    <select name="district" className={styles.input} required value={formData.district} onChange={handleAddressInputChange} disabled={!formData.province}>
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Ward</label>
                                    <select name="ward" className={styles.input} required value={formData.ward} onChange={handleAddressInputChange} disabled={!formData.district}>
                                        <option value="">-- Select Ward --</option>
                                        {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Street Address</label>
                                    <input name="streetAddress" className={styles.input} required value={formData.streetAddress} onChange={handleAddressInputChange} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Note</label>
                                <textarea name="note" className={styles.input} value={formData.note} onChange={handleAddressInputChange}></textarea>
                            </div>
                            <div className={styles.checkboxGroup} onClick={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}>
                                <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleAddressInputChange} />
                                <label htmlFor="isDefault">Set as default address</label>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}>Save Address</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className={styles.modalOverlayConfirm}>
                    <div className={styles.confirmBox}>
                        <BiTrash className={styles.warnIcon} />
                        <h3>{confirmModal.title}</h3>
                        <p className={styles.confirmMessage}>{confirmModal.message}</p>
                        <div className={styles.confirmActions}>
                            <button className={styles.cancelBtnConfirm} onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}>Cancel</button>
                            <button
                                className={confirmModal.type === 'danger' ? styles.dangerBtn : styles.warnBtn}
                                onClick={confirmModal.onConfirm}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
