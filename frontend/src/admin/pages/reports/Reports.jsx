import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { useSettings } from '../../../context/SettingsContext';
import styles from './Reports.module.css';
import { BiDownload, BiFilterAlt, BiPackage, BiTrendingUp, BiChevronDown, BiChevronRight } from 'react-icons/bi';
import { FaFilePdf } from 'react-icons/fa';
import { useToast } from '../../../components/common/toast/ToastContext';

const Reports = () => {
    const { settings } = useSettings();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('products');
    const [productData, setProductData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const fetchProductReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/reports/products');
            setProductData(res.data);
        } catch (error) {
            console.error('Error fetching product report:', error);
            toast.error('Error', 'Failed to load product report');
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenueReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/admin/reports/revenue?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setRevenueData(res.data);
        } catch (error) {
            console.error('Error fetching revenue report:', error);
            toast.error('Error', 'Failed to load revenue report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'products') {
            fetchProductReport();
        } else {
            fetchRevenueReport();
        }
    }, [activeTab]);

    const handleExport = async (type, format = 'excel') => {
        try {
            const response = await axios.get(`/admin/reports/export/${type}?format=${format}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const ext = format === 'pdf' ? 'pdf' : 'xlsx';
            link.setAttribute('download', `${type}_report_${new Date().getTime()}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Error', 'Export failed');
        }
    };

    return (
        <div className={styles.reportsContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Reports System</h1>
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <BiPackage /> Products & Inventory
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'revenue' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        <BiTrendingUp /> Revenue Analytics
                    </button>
                </div>
            </div>

            <div className={styles.contentCard}>
                <div className={styles.toolbar}>
                    {activeTab === 'revenue' && (
                        <div className={styles.filters}>
                            <input 
                                type="date" 
                                value={dateRange.start} 
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                className={styles.dateInput}
                            />
                            <span>to</span>
                            <input 
                                type="date" 
                                value={dateRange.end} 
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                className={styles.dateInput}
                            />
                            <button onClick={fetchRevenueReport} className={styles.filterBtn}>
                                <BiFilterAlt /> Filter
                            </button>
                        </div>
                    )}
                    <div className={styles.exportButtons}>
                        <button 
                            className={styles.pdfBtn}
                            onClick={() => handleExport(activeTab, 'pdf')}
                        >
                            <FaFilePdf /> Export PDF
                        </button>
                        <button 
                            className={styles.exportBtn}
                            onClick={() => handleExport(activeTab, 'excel')}
                        >
                            <BiDownload /> Export Excel
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading data...</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        {activeTab === 'products' ? (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Color</th>
                                        <th>Size</th>
                                        <th>Sold</th>
                                        <th>Stock</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(
                                        productData.reduce((acc, item) => {
                                            const category = item.categoryName || 'Uncategorized';
                                            if (!acc[category]) acc[category] = [];
                                            acc[category].push(item);
                                            return acc;
                                        }, {})
                                    ).map(([category, items]) => (
                                        <React.Fragment key={category}>
                                            <tr 
                                                className={styles.categoryHeader}
                                                onClick={() => toggleCategory(category)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td colSpan="7">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {expandedCategories[category] ? <BiChevronDown /> : <BiChevronRight />}
                                                        {category}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedCategories[category] && items.map((item, idx) => (
                                                <tr key={`${category}-${idx}`}>
                                                    <td>{item.name}</td>
                                                    <td><span className={styles.skuBadge}>{item.sku}</span></td>
                                                    <td>{item.color}</td>
                                                    <td>{item.size}</td>
                                                    <td>{item.soldQuantity}</td>
                                                    <td>
                                                        <span className={item.currentStock < 10 ? styles.lowStock : ''}>
                                                            {item.currentStock}
                                                        </span>
                                                    </td>
                                                    <td>{settings.currency_symbol}{item.totalRevenue.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Orders</th>
                                        <th>Subtotal</th>
                                        <th>Discount</th>
                                        <th>Delivery</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueData.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.date}</td>
                                            <td>{item.orderCount}</td>
                                            <td>{settings.currency_symbol}{item.subtotal.toLocaleString()}</td>
                                            <td className={styles.discount}>-{settings.currency_symbol}{item.discountAmount.toLocaleString()}</td>
                                            <td>{settings.currency_symbol}{item.deliveryCharge.toLocaleString()}</td>
                                            <td className={styles.total}>{settings.currency_symbol}{item.totalRevenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
