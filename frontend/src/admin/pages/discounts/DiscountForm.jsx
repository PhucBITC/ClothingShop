import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import { useToast } from '../../../components/common/toast/ToastContext';
import styles from './DiscountForm.module.css';
import { motion } from 'framer-motion';
import { BiSave, BiX, BiPurchaseTag, BiCalendar } from 'react-icons/bi';

const DiscountForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchDiscount();
        }
    }, [id]);

    const fetchDiscount = async () => {
        try {
            setFetching(true);
            const response = await axios.get(`/discounts/${id}`);
            const data = response.data;
            
            // Format dates for input[type="datetime-local"]
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const offset = date.getTimezoneOffset() * 60000;
                const localISODate = new Date(date.getTime() - offset).toISOString().slice(0, 16);
                return localISODate;
            };

            setFormData({
                ...data,
                startDate: formatDate(data.startDate),
                endDate: formatDate(data.endDate),
                value: data.value || '',
                minOrderAmount: data.minOrderAmount || '',
                maxDiscountAmount: data.maxDiscountAmount || '',
                usageLimit: data.usageLimit || ''
            });
        } catch (error) {
            console.error('Error fetching discount:', error);
            toast.error('Failed to load discount details');
            navigate('/admin/discounts');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.code) throw new Error('Discount code is required');
            if (!formData.value) throw new Error('Discount value is required');
            
            const numValue = parseFloat(formData.value);
            if (isNaN(numValue) || numValue <= 0) throw new Error('Discount value must be greater than 0');
            if (formData.type === 'PERCENTAGE' && numValue > 100) throw new Error('Percentage discount cannot exceed 100%');

            const now = new Date();
            const start = formData.startDate ? new Date(formData.startDate) : null;
            const end = formData.endDate ? new Date(formData.endDate) : null;

            // For new discounts, start date shouldn't be in the past
            if (!isEditMode && start && start < now) {
                // Allow a small margin (e.g., 1 minute) for submission delay
                if (now - start > 60000) {
                    throw new Error('Start date cannot be in the past');
                }
            }

            if (start && end && end <= start) {
                throw new Error('End date must be after start date');
            }

            if (!start && end) {
                throw new Error('Start date is required if end date is set');
            }

            const payload = { ...formData };
            
            // Clean numeric fields
            payload.value = numValue;
            payload.minOrderAmount = formData.minOrderAmount ? Math.max(0, parseFloat(formData.minOrderAmount)) : null;
            payload.maxDiscountAmount = formData.maxDiscountAmount ? Math.max(0, parseFloat(formData.maxDiscountAmount)) : null;
            payload.usageLimit = formData.usageLimit ? Math.max(1, parseInt(formData.usageLimit)) : null;

            if (isEditMode) {
                await axios.put(`/discounts/${id}`, payload);
                toast.success('Discount updated successfully');
            } else {
                await axios.post('/discounts', payload);
                toast.success('Discount created successfully');
            }
            navigate('/admin/discounts');
        } catch (error) {
            console.error('Error saving discount:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to save discount');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className={styles.loading}>Loading discount data...</div>;
    }

    return (
        <motion.div 
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {isEditMode ? `Edit Discount: ${formData.code}` : 'Create New Discount'}
                </h1>
                <button 
                    className={styles.cancelLink}
                    onClick={() => navigate('/admin/discounts')}
                >
                    <BiX /> Cancel
                </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>General Information</h3>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Discount Code *</label>
                            <div className={styles.inputWithIcon}>
                                <BiPurchaseTag className={styles.inputIcon} />
                                <input 
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="e.g. SUMMER20"
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <p className={styles.helpText}>Customers will enter this code at checkout.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <input 
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="e.g. 20% off for summer collection"
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Value & Type</h3>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Discount Type</label>
                            <select 
                                name="type" 
                                value={formData.type} 
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Discount Value *</label>
                            <input 
                                type="number"
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                placeholder={formData.type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 10.00'}
                                step="0.01"
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Restrictions</h3>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Minimum Order Amount ($)</label>
                            <input 
                                type="number"
                                name="minOrderAmount"
                                value={formData.minOrderAmount}
                                onChange={handleChange}
                                placeholder="e.g. 50.00"
                                step="0.01"
                                className={styles.input}
                            />
                        </div>

                        {formData.type === 'PERCENTAGE' && (
                            <div className={styles.formGroup}>
                                <label>Maximum Discount Amount ($)</label>
                                <input 
                                    type="number"
                                    name="maxDiscountAmount"
                                    value={formData.maxDiscountAmount}
                                    onChange={handleChange}
                                    placeholder="e.g. 20.00 (Optional limit)"
                                    step="0.01"
                                    className={styles.input}
                                />
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Usage Limit</label>
                            <input 
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                placeholder="Total times this code can be used"
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Active Period</h3>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Start Date & Time</label>
                            <div className={styles.inputWithIcon}>
                                <BiCalendar className={styles.inputIcon} />
                                <input 
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    onClick={(e) => e.target.showPicker()}
                                    min={!isEditMode ? new Date().toISOString().slice(0, 16) : undefined}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>End Date & Time</label>
                            <div className={styles.inputWithIcon}>
                                <BiCalendar className={styles.inputIcon} />
                                <input 
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    onClick={(e) => e.target.showPicker()}
                                    min={formData.startDate || new Date().toISOString().slice(0, 16)}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.checkboxGroup}>
                        <input 
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                        <label htmlFor="isActive">Set as Active</label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button 
                        type="button" 
                        className={styles.secondaryBtn}
                        onClick={() => navigate('/admin/discounts')}
                    >
                        Back to List
                    </button>
                    <button 
                        type="submit" 
                        className={styles.primaryBtn}
                        disabled={loading}
                    >
                        <BiSave /> {loading ? 'Saving...' : 'Save Discount'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default DiscountForm;
