import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        store_name: 'EzMart',
        currency_symbol: '$',
        store_email: '',
        store_phone: '',
        store_address: '',
        items_per_page: '8'
    });

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/admin/settings/public');
            if (res.data) {
                setSettings(prev => ({ ...prev, ...res.data }));
            }
        } catch (error) {
            console.error("Error fetching public settings:", error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const formatPrice = (price) => {
        const p = parseFloat(price) || 0;
        return `${settings.currency_symbol}${p.toFixed(2)}`;
    };

    return (
        <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings, formatPrice }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
