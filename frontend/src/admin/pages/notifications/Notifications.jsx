import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
    BiSearch, BiXCircle, BiShow, BiCheckCircle, 
    BiTrash, BiBell, BiMessageDetail, BiCheckDouble 
} from 'react-icons/bi';
import axios from '../../../api/axios';
import styles from './Notifications.module.css';
import { useToast } from '../../../components/common/toast/ToastContext';

const Notifications = () => {
    const toast = useToast();
    const { refreshMessages } = useOutletContext();
    
    // Tabs state
    const [activeTab, setActiveTab] = useState('system'); // system, messages
    
    // Data states
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [contactMessages, setContactMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, READ, UNREAD
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, type: '', id: null, title: '', message: '' });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [notifRes, contactRes] = await Promise.all([
                axios.get('/notifications'),
                axios.get('/contact')
            ]);
            setSystemNotifications(notifRes.data);
            setContactMessages(contactRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Error', 'Failed to load notifications data');
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            if (activeTab === 'system') {
                await axios.patch(`/notifications/${id}/read`);
                setSystemNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            } else {
                await axios.put(`/contact/${id}/read`);
                setContactMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
            }
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            if (activeTab === 'system') {
                await axios.post('/notifications/mark-all-read');
                setSystemNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } else {
                // Assuming contact has a bulk read if we use selectedIds, 
                // but let's just do all for the current view if no IDs selected
                const unreadIds = contactMessages.filter(m => !m.isRead).map(m => m.id);
                if (unreadIds.length > 0) {
                    await axios.put('/contact/bulk-read', unreadIds);
                    setContactMessages(prev => prev.map(m => ({ ...m, isRead: true })));
                }
            }
            toast.success('Success', `All ${activeTab} marked as read`);
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to mark all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            if (activeTab === 'system') {
                await axios.delete(`/notifications/${id}`);
                setSystemNotifications(prev => prev.filter(n => n.id !== id));
            } else {
                await axios.delete(`/contact/${id}`);
                setContactMessages(prev => prev.filter(m => m.id !== id));
            }
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            if (selectedDetail?.id === id) setSelectedDetail(null);
            toast.success('Success', 'Deleted successfully');
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to delete');
        } finally {
            setConfirmConfig({ ...confirmConfig, isOpen: false });
        }
    };

    const handleBulkDelete = async () => {
        try {
            if (activeTab === 'system') {
                // If API supports bulk delete for notifications, use it. 
                // Otherwise loop or clear all.
                // For now, let's assume we use what's available.
                await Promise.all(selectedIds.map(id => axios.delete(`/notifications/${id}`)));
                setSystemNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
            } else {
                await axios.delete('/contact/bulk-delete', { data: selectedIds });
                setContactMessages(prev => prev.filter(m => !selectedIds.includes(m.id)));
            }
            setSelectedIds([]);
            toast.success('Success', `${selectedIds.length} items deleted`);
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to delete items');
        } finally {
            setConfirmConfig({ ...confirmConfig, isOpen: false });
        }
    };

    const currentData = activeTab === 'system' ? systemNotifications : contactMessages;

    const filteredData = useMemo(() => {
        return currentData.filter(item => {
            const contentString = (item.title || item.name || '') + ' ' + (item.content || item.message || '') + ' ' + (item.email || '');
            const matchesSearch = contentString.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = 
                filterStatus === 'ALL' || 
                (filterStatus === 'READ' && item.isRead) ||
                (filterStatus === 'UNREAD' && !item.isRead);

            return matchesSearch && matchesStatus;
        });
    }, [currentData, searchTerm, filterStatus]);

    const stats = {
        systemUnread: systemNotifications.filter(n => !n.isRead).length,
        messagesUnread: contactMessages.filter(m => !m.isRead).length
    };

    const openConfirm = (type, id = null) => {
        let title = 'Confirm Delete';
        let message = '';
        
        if (type === 'SINGLE') {
            message = `Are you sure you want to delete this ${activeTab === 'system' ? 'notification' : 'message'}?`;
        } else if (type === 'BULK') {
            message = `Are you sure you want to delete ${selectedIds.length} selected items?`;
        }

        setConfirmConfig({ isOpen: true, type, id, title, message });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredData.map(d => d.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (loading) return <div className={styles.loading}>Loading notifications...</div>;

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Notifications Center</h1>
                <p className={styles.stats}>
                    Managed all your system alerts and customer inquiries in one place.
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className={styles.tabsWrapper}>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'system' ? styles.activeTab : ''}`}
                    onClick={() => { setActiveTab('system'); setSelectedIds([]); setSearchTerm(''); }}
                >
                    <BiBell /> 
                    System Alerts
                    {stats.systemUnread > 0 && <span className={styles.tabBadge}>{stats.systemUnread}</span>}
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'messages' ? styles.activeTab : ''}`}
                    onClick={() => { setActiveTab('messages'); setSelectedIds([]); setSearchTerm(''); }}
                >
                    <BiMessageDetail /> 
                    Customer Messages
                    {stats.messagesUnread > 0 && <span className={styles.tabBadge}>{stats.messagesUnread}</span>}
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <BiSearch size={20} />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'system' ? "Search alerts..." : "Search name, email, content..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
                            <BiXCircle />
                        </button>
                    )}
                </div>

                <div className={styles.filterGroup}>
                    <select 
                        className={styles.filterSelect}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="UNREAD">Unread</option>
                        <option value="READ">Read</option>
                    </select>
                </div>
                
                <div className={styles.actionGroup}>
                    {selectedIds.length > 0 && (
                        <button className={styles.bulkDeleteBtn} onClick={() => openConfirm('BULK')}>
                            <BiTrash /> Delete ({selectedIds.length})
                        </button>
                    )}
                    <button className={styles.markAllReadBtnMain} onClick={handleMarkAllRead}>
                        <BiCheckDouble /> Mark All Read
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>{activeTab === 'system' ? 'Notification' : 'Customer'}</th>
                            <th>Preview</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className={selectedIds.includes(item.id) ? styles.selectedRow : ''}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                        />
                                    </td>
                                    <td>
                                        {activeTab === 'system' ? (
                                            <div className={styles.nameCell}>{item.title}</div>
                                        ) : (
                                            <>
                                                <div className={styles.nameCell}>{item.name}</div>
                                                <div className={styles.emailCell}>{item.email}</div>
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.messageSnippet}>
                                            {activeTab === 'system' ? item.content : item.message}
                                        </div>
                                    </td>
                                    <td className={styles.dateCell}>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${item.isRead ? styles.statusRead : styles.statusUnread}`}>
                                            {item.isRead ? 'Read' : 'Unread'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.viewBtn}`}
                                                title="View Details"
                                                onClick={() => {
                                                    setSelectedDetail(item);
                                                    if (!item.isRead) handleMarkAsRead(item.id);
                                                }}
                                            >
                                                <BiShow />
                                            </button>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                title="Delete"
                                                onClick={() => openConfirm('SINGLE', item.id)}
                                            >
                                                <BiTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    No {activeTab} found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedDetail && (
                <div className={styles.modalOverlay} onClick={() => setSelectedDetail(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setSelectedDetail(null)}>&times;</button>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {activeTab === 'system' ? 'Notification Details' : 'Message Details'}
                            </h2>
                        </div>
                        <div className={styles.modalInfo}>
                            {activeTab === 'system' ? (
                                <p><strong>Subject:</strong> {selectedDetail.title}</p>
                            ) : (
                                <p><strong>From:</strong> {selectedDetail.name} ({selectedDetail.email})</p>
                            )}
                            <p><strong>Date:</strong> {new Date(selectedDetail.createdAt).toLocaleString()}</p>
                        </div>
                        <div className={styles.modalBody}>
                            {activeTab === 'system' ? selectedDetail.content : selectedDetail.message}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={`${styles.modalBtn} ${styles.closeBtn}`} onClick={() => setSelectedDetail(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmConfig.isOpen && (
                <div className={styles.modalOverlay} onClick={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}>
                    <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.confirmHeader}>
                            <h2 className={styles.confirmTitle}>{confirmConfig.title}</h2>
                        </div>
                        <div className={styles.confirmBody}>
                            {confirmConfig.message}
                        </div>
                        <div className={styles.confirmFooter}>
                            <button 
                                className={styles.cancelBtn} 
                                onClick={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                            >
                                Cancel
                            </button>
                            <button 
                                className={styles.confirmDeleteBtn}
                                onClick={() => {
                                    if (confirmConfig.type === 'SINGLE') handleDelete(confirmConfig.id);
                                    else if (confirmConfig.type === 'BULK') handleBulkDelete();
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
