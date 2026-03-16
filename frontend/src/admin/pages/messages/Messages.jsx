import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BiSearch, BiXCircle, BiShow, BiCheckCircle, BiTrash, BiEnvelope } from 'react-icons/bi';
import axios from '../../../api/axios';
import styles from './Messages.module.css';
import { useToast } from '../../../components/common/toast/ToastContext';

const Messages = () => {
    const toast = useToast();
    const { refreshMessages } = useOutletContext();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, READ, UNREAD
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, type: '', id: null, title: '', message: '' });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get('/contact');
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Error', 'Failed to load messages');
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`/contact/${id}/read`);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage(prev => ({ ...prev, isRead: true }));
            }
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to mark as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/contact/${id}`);
            setMessages(prev => prev.filter(m => m.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
            toast.success('Success', 'Message deleted');
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to delete message');
        } finally {
            setConfirmConfig({ ...confirmConfig, isOpen: false });
        }
    };

    const handleBulkDelete = async () => {
        try {
            await axios.delete('/contact/bulk-delete', { data: selectedIds });
            setMessages(prev => prev.filter(m => !selectedIds.includes(m.id)));
            setSelectedIds([]);
            toast.success('Success', `${selectedIds.length} messages deleted`);
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to delete messages');
        } finally {
            setConfirmConfig({ ...confirmConfig, isOpen: false });
        }
    };

    const handleBulkRead = async () => {
        if (selectedIds.length === 0) return;
        try {
            await axios.put('/contact/bulk-read', selectedIds);
            setMessages(prev => prev.map(m => 
                selectedIds.includes(m.id) ? { ...m, isRead: true } : m
            ));
            setSelectedIds([]);
            toast.success('Success', `${selectedIds.length} messages marked as read`);
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to mark messages as read');
        }
    };

    const handleDeleteAll = async () => {
        const allIds = messages.map(m => m.id);
        try {
            await axios.delete('/contact/bulk-delete', { data: allIds });
            setMessages([]);
            setSelectedIds([]);
            toast.success('Success', 'All messages cleared');
            refreshMessages();
        } catch (error) {
            toast.error('Error', 'Failed to clear messages');
        } finally {
            setConfirmConfig({ ...confirmConfig, isOpen: false });
        }
    };

    const openConfirm = (type, id = null) => {
        let title = 'Confirm Delete';
        let message = '';
        
        if (type === 'SINGLE') {
            const msg = messages.find(m => m.id === id);
            message = `Are you sure you want to delete the message from ${msg?.name}?`;
        } else if (type === 'BULK') {
            message = `Are you sure you want to delete ${selectedIds.length} selected messages?`;
        } else if (type === 'ALL') {
            message = 'Are you sure you want to delete ALL messages? This action cannot be undone.';
        }

        setConfirmConfig({ isOpen: true, type, id, title, message });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredMessages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredMessages.map(m => m.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredMessages = useMemo(() => {
        return messages.filter(m => {
            const matchesSearch = 
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.message.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = 
                filterStatus === 'ALL' || 
                (filterStatus === 'READ' && m.isRead) ||
                (filterStatus === 'UNREAD' && !m.isRead);

            return matchesSearch && matchesStatus;
        });
    }, [messages, searchTerm, filterStatus]);

    const unreadCount = messages.filter(m => !m.isRead).length;

    if (loading) return <div className={styles.loading}>Loading messages...</div>;

    return (
        <div className={styles.messagesContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Customer Messages</h1>
                <p className={styles.stats}>{unreadCount} unread inquiries out of {messages.length} total</p>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <BiSearch size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or content..." 
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
                        <>
                            <button className={styles.bulkReadBtn} onClick={handleBulkRead}>
                                <BiCheckCircle /> Mark as Read ({selectedIds.length})
                            </button>
                            <button className={styles.bulkDeleteBtn} onClick={() => openConfirm('BULK')}>
                                <BiTrash /> Delete Selected ({selectedIds.length})
                            </button>
                        </>
                    )}
                    {messages.length > 0 && (
                        <button className={styles.deleteAllBtn} onClick={() => openConfirm('ALL')}>
                            <BiTrash /> Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={filteredMessages.length > 0 && selectedIds.length === filteredMessages.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>Customer</th>
                            <th>Message Preview</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMessages.length > 0 ? (
                            filteredMessages.map((msg) => (
                                <tr key={msg.id} className={selectedIds.includes(msg.id) ? styles.selectedRow : ''}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(msg.id)}
                                            onChange={() => toggleSelect(msg.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.nameCell}>{msg.name}</div>
                                        <div className={styles.emailCell}>{msg.email}</div>
                                    </td>
                                    <td>
                                        <div className={styles.messageSnippet}>{msg.message}</div>
                                    </td>
                                    <td className={styles.dateCell}>
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${msg.isRead ? styles.statusRead : styles.statusUnread}`}>
                                            {msg.isRead ? 'Read' : 'Unread'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.viewBtn}`}
                                                title="View Details"
                                                onClick={() => {
                                                    setSelectedMessage(msg);
                                                    if (!msg.isRead) handleMarkAsRead(msg.id);
                                                }}
                                            >
                                                <BiShow />
                                            </button>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                title="Delete"
                                                onClick={() => openConfirm('SINGLE', msg.id)}
                                            >
                                                <BiTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    No messages found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Message Details Modal */}
            {selectedMessage && (
                <div className={styles.modalOverlay} onClick={() => setSelectedMessage(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setSelectedMessage(null)}>&times;</button>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Message Details</h2>
                        </div>
                        <div className={styles.modalInfo}>
                            <p><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
                            <p><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                        </div>
                        <div className={styles.modalBody}>
                            {selectedMessage.message}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={`${styles.modalBtn} ${styles.closeBtn}`} onClick={() => setSelectedMessage(null)}>
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
                                    else if (confirmConfig.type === 'ALL') handleDeleteAll();
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

export default Messages;
