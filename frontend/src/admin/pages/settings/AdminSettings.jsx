import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import styles from './AdminSettings.module.css';
import { BiSave, BiLoaderAlt, BiCog, BiStore, BiEnvelope, BiPhone, BiMap, BiDollar, BiBook } from 'react-icons/bi';
import { useToast } from '../../../components/common/toast/ToastContext';
import { useSettings } from '../../../context/SettingsContext';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        store_name: '',
        store_email: '',
        store_phone: '',
        store_address: '',
        currency_symbol: '$',
        items_per_page: '10',
        story_title: '',
        story_content: '',
        mission: '',
        vision: ''
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
                            <input 
                                type="number" 
                                name="items_per_page" 
                                value={settings.items_per_page} 
                                onChange={handleChange}
                                min="1"
                                max="100"
                                placeholder="e.g. 12"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}><BiBook /> Store Story (Our Story Page)</h2>
                    <div className={styles.fullWidthGroup}>
                        <label>Story Title</label>
                        <input 
                            type="text" 
                            name="story_title" 
                            value={settings.story_title} 
                            onChange={handleChange} 
                            placeholder="e.g. Our Journey Since 2020"
                        />
                    </div>
                    <div className={styles.fullWidthGroup} style={{ marginTop: '1rem' }}>
                        <label>Story Content</label>
                        <textarea 
                            name="story_content" 
                            value={settings.story_content} 
                            onChange={handleChange} 
                            placeholder="Tell your brand story here..."
                            rows="5"
                        />
                    </div>
                    <div className={styles.grid} style={{ marginTop: '1rem' }}>
                        <div className={styles.group}>
                            <label>Mission Statement</label>
                            <textarea 
                                name="mission" 
                                value={settings.mission} 
                                onChange={handleChange} 
                                placeholder="Your brand mission..."
                                rows="3"
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Vision Statement</label>
                            <textarea 
                                name="vision" 
                                value={settings.vision} 
                                onChange={handleChange} 
                                placeholder="Your brand vision..."
                                rows="3"
                            />
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
