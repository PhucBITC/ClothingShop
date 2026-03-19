import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import styles from './AdminSettings.module.css';
import { BiSave, BiLoaderAlt, BiCog, BiStore, BiEnvelope, BiPhone, BiMap, BiDollar } from 'react-icons/bi';
import { useToast } from '../../../components/common/toast/ToastContext';
import { useSettings } from '../../../context/SettingsContext';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        store_name: '',
        store_email: '',
        store_phone: '',
        store_address: '',
        currency_symbol: '$',
        items_per_page: '10'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { refreshSettings } = useSettings();
    const toast = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/admin/settings');
                // Merge with defaults
                setSettings(prev => ({ ...prev, ...res.data }));
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Failed to load settings.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axios.put('/admin/settings', settings);
            await refreshSettings();
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <BiLoaderAlt className={styles.spinner} />
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>System Settings</h1>
                <p className={styles.subtitle}>Configure global store information and display preferences.</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}><BiStore /> Store Information</h2>
                    <div className={styles.grid}>
                        <div className={styles.group}>
                            <label>Store Name</label>
                            <input 
                                type="text" 
                                name="store_name" 
                                value={settings.store_name} 
                                onChange={handleChange} 
                                placeholder="Enter store name"
                                required
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Contact Email</label>
                            <div className={styles.inputWithIcon}>
                                <BiEnvelope />
                                <input 
                                    type="email" 
                                    name="store_email" 
                                    value={settings.store_email} 
                                    onChange={handleChange} 
                                    placeholder="contact@store.com"
                                />
                            </div>
                        </div>
                        <div className={styles.group}>
                            <label>Phone Number</label>
                            <div className={styles.inputWithIcon}>
                                <BiPhone />
                                <input 
                                    type="text" 
                                    name="store_phone" 
                                    value={settings.store_phone} 
                                    onChange={handleChange} 
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                        <div className={styles.group}>
                            <label>Store Address</label>
                            <div className={styles.inputWithIcon}>
                                <BiMap />
                                <input 
                                    type="text" 
                                    name="store_address" 
                                    value={settings.store_address} 
                                    onChange={handleChange} 
                                    placeholder="123 Fashion Ave, NY"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}><BiCog /> Regional & Display</h2>
                    <div className={styles.grid}>
                        <div className={styles.group}>
                            <label>Currency Symbol</label>
                            <input 
                                type="text" 
                                name="currency_symbol" 
                                value={settings.currency_symbol} 
                                onChange={handleChange} 
                                placeholder="$"
                                maxLength="3"
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Items Per Page (Frontend)</label>
                            <select 
                                name="items_per_page" 
                                value={settings.items_per_page} 
                                onChange={handleChange}
                            >
                                <option value="8">8</option>
                                <option value="12">12</option>
                                <option value="24">24</option>
                                <option value="48">48</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                        {isSaving ? <BiLoaderAlt className={styles.spinner} /> : <BiSave />}
                        {isSaving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
