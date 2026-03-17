import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { BiDollar, BiCart, BiUser, BiDotsHorizontalRounded } from 'react-icons/bi';
import styles from './Dashboard.module.css';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import TargetModal from '../components/TargetModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const { theme } = useTheme();
    const [period, setPeriod] = useState('WEEK');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const isDarkMode = theme === 'Dark';
    const chartColors = {
        grid: isDarkMode ? '#2a2830' : '#E0E0E0',
        text: isDarkMode ? '#a0aec0' : '#9ea6b9',
        tooltipBg: isDarkMode ? '#131118' : '#ffffff',
        tooltipBorder: isDarkMode ? '#2a2830' : '#E0E0E0',
        pieEmpty: isDarkMode ? '#1a1820' : '#f0f2f5'
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            let url = `/admin/dashboard/stats?period=${period}`;
            if (period === 'CUSTOM' && startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await api.get(url);
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch dashboard data.');
            setLoading(false);
        }
    };

    const handleUpdateTarget = () => {
        setIsModalOpen(true);
    };

    const saveTarget = async (newTarget) => {
        try {
            await api.post('/admin/dashboard/target', { target: parseFloat(newTarget) });
            fetchStats();
        } catch (error) {
            alert('Failed to update target');
            throw error;
        }
    };

    const handleRestock = (p) => {
        const productId = (p && typeof p === 'object') ? (p.productId || p.id) : p;
        
        if (productId) {
            navigate(`/admin/products/edit/${productId}`);
        } else {
            console.error("Product ID is missing for restock action!", p);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [period]);

    if (loading) {
        return <div className={styles.loading}>Loading Dashboard...</div>;
    }

    if (error) {
        return <div className={styles.error} style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;
    }

    // Default values if data hasn't loaded or fails
    const revenueData = stats?.revenueData || [];
    const categoryData = stats?.categoryData || [];
    const totalSales = stats?.totalSales || 0;
    const totalOrders = stats?.totalOrders || 0;
    const totalVisitors = stats?.totalVisitors || 0;
    const salesChange = stats?.salesChange || 0;
    const ordersChange = stats?.ordersChange || 0;
    const visitorsChange = stats?.visitorsChange || 0;
    const lowStockProducts = stats?.lowStockProducts || [];
    const monthlyTarget = stats?.monthlyTarget || 10000;
    const currentMonthSales = stats?.currentMonthSales || 0;
    const conversionData = stats?.conversionData || [];

    const targetPercent = Math.min((currentMonthSales / monthlyTarget) * 100, 100);
    const targetData = [
        { name: 'Achieved', value: targetPercent, color: '#FF8800' },
        { name: 'Remaining', value: Math.max(0, 100 - targetPercent), color: '#F0F0F0' },
    ];

    const getProductImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:8080/api/files/${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
    };

    return (
        <motion.div
            className={styles.dashboardContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Left Column */}
            {/* Stats - Row 1 */}
            <div className={`${styles.card} ${styles.span1}`}>
                <div className={styles.cardHeader}>
                    <span>Total Sales</span>
                    <div className={`${styles.iconCircle} ${styles.bgOrange}`}>
                        <BiDollar />
                    </div>
                </div>
                <div className={styles.statsValue}>${totalSales.toLocaleString()}</div>
                <div className={styles.statsChange}>
                    <span className={salesChange >= 0 ? styles.textGreen : styles.textRed}>
                        {salesChange >= 0 ? '+' : ''}{salesChange.toFixed(2)}%
                    </span> vs last week
                </div>
            </div>

            <div className={`${styles.card} ${styles.span1}`}>
                <div className={styles.cardHeader}>
                    <span>Total Orders</span>
                    <div className={`${styles.iconCircle} ${styles.bgGray}`}>
                        <BiCart />
                    </div>
                </div>
                <div className={styles.statsValue}>{totalOrders.toLocaleString()}</div>
                <div className={styles.statsChange}>
                    <span className={ordersChange >= 0 ? styles.textGreen : styles.textRed}>
                        {ordersChange >= 0 ? '+' : ''}{ordersChange.toFixed(2)}%
                    </span> vs last week
                </div>
            </div>

            <div className={`${styles.card} ${styles.span1}`}>
                <div className={styles.cardHeader}>
                    <span>Total Visitors</span>
                    <div className={`${styles.iconCircle} ${styles.bgGray}`}>
                        <BiUser />
                    </div>
                </div>
                <div className={styles.statsValue}>{totalVisitors.toLocaleString()}</div>
                <div className={styles.statsChange}>
                    <span className={visitorsChange >= 0 ? styles.textGreen : styles.textRed}>
                        {visitorsChange >= 0 ? '+' : ''}{visitorsChange.toFixed(2)}%
                    </span> vs last week
                </div>
            </div>

            {/* Main Charts - Row 2 */}
            <div className={`${styles.chartCard} ${styles.span2}`}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.cardTitle}>Revenue Analytics</h3>
                            <div className={styles.filterGroup}>
                                <button 
                                    className={`${styles.timeFilter} ${period === 'WEEK' ? styles.active : ''}`}
                                    onClick={() => setPeriod('WEEK')}
                                >
                                    Last 7 Days
                                </button>
                                <button 
                                    className={`${styles.timeFilter} ${period === 'MONTH' ? styles.active : ''}`}
                                    onClick={() => setPeriod('MONTH')}
                                >
                                    Last 30 Days
                                </button>
                                <button 
                                    className={`${styles.timeFilter} ${period === 'YEAR' ? styles.active : ''}`}
                                    onClick={() => setPeriod('YEAR')}
                                >
                                    This Year
                                </button>
                                <button 
                                    className={`${styles.timeFilter} ${period === 'CUSTOM' ? styles.active : ''}`}
                                    onClick={() => setPeriod('CUSTOM')}
                                >
                                    Custom
                                </button>
                            </div>
                        </div>

                        {period === 'CUSTOM' && (
                            <div className={styles.datePickerContainer}>
                                <input 
                                    type="date" 
                                    className={styles.dateInput} 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className={styles.dateSeparator}>to</span>
                                <input 
                                    type="date" 
                                    className={styles.dateInput} 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <button className={styles.applyBtn} onClick={fetchStats}>
                                    Apply
                                </button>
                            </div>
                        )}
                        <div className={styles.revenueChart}>
                            <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF8800" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#FF8800" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ 
                                            borderRadius: 8, 
                                            border: `1px solid ${chartColors.tooltipBorder}`, 
                                            background: chartColors.tooltipBg,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                                        }}
                                        itemStyle={{ color: isDarkMode ? '#f0f0f0' : '#131118' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#FF8800" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    <Area type="monotone" dataKey="order" stroke="#FFDCA8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
            </div>

            <div className={`${styles.chartCard} ${styles.span1}`} style={{ textAlign: 'center' }}>
                        <div className={styles.chartHeader} style={{ justifyContent: 'space-between' }}>
                            <h3 className={styles.cardTitle}>Monthly Target</h3>
                            <button 
                                onClick={handleUpdateTarget}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', padding: '5px' }}
                                title="Edit Target"
                            >
                                <BiDotsHorizontalRounded size={24} />
                            </button>
                        </div>

                        <div style={{ position: 'relative', height: 160 }}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={targetData}
                                        cx="50%"
                                        cy="80%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={0}
                                        dataKey="value"
                                    >
                                        <Cell fill="#FF8800" stroke="none" />
                                        <Cell fill={chartColors.pieEmpty} stroke="none" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{targetPercent.toFixed(1)}%</div>
                                <div style={{ fontSize: '12px', color: '#27AE60' }}>
                                    ${currentMonthSales.toLocaleString()} / ${monthlyTarget.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <p style={{ fontSize: 14, fontWeight: 600 }}>Great Progress! 🎉</p>
                            <p style={{ fontSize: 12, color: '#777', marginTop: 4 }}>
                                Our achievement increased by $200,000; let's reach 100% next month.
                            </p>
                        </div>
            </div>

            {/* Conversion & Categories - Row 3 */}
            <div className={`${styles.chartCard} ${styles.span2}`}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.cardTitle}>Conversion Rate</h3>
                    <div className={styles.timeFilter} style={{ cursor: 'default' }}>
                        {period === 'WEEK' ? 'This Week' : 
                         period === 'MONTH' ? 'This Month' : 
                         period === 'YEAR' ? 'This Year' : 'Custom Period'}
                    </div>
                </div>

                <div className={styles.conversionWrapper}>
                    <div className={styles.gridLines}>
                        {[1, 2, 3, 4].map(i => <div key={i} className={styles.gridLine} />)}
                    </div>
                    <div className={styles.conversionContainer}>
                        {conversionData.map((step, i) => {
                            // Calculate conversion rate to next step
                            const nextStep = conversionData[i + 1];
                            const conversionToNext = (nextStep && step.val_num > 0) ? ((nextStep.val_num / step.val_num) * 100).toFixed(0) : null;

                            return (
                                <div key={i} className={styles.barGroup}>
                                    <div className={styles.barValue}>{step.val}</div>
                                    <div className={`${styles.barChange} ${step.red ? styles.negative : ''}`}>
                                        {step.change}
                                    </div>
                                    <div
                                        className={styles.bar}
                                        style={{ height: `${step.h * 1.2}px` }}
                                    />
                                    <span className={styles.barLabel}>{step.label}</span>

                                    {conversionToNext && (
                                        <div className={styles.conversionGap}>
                                            <span className={styles.gapPercent}>{conversionToNext}%</span>
                                            <div className={styles.gapLine} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={`${styles.chartCard} ${styles.span1}`}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.cardTitle}>Top Categories</h3>
                    <NavLink to="/admin/categories" className={styles.seeAllLink}>See All</NavLink>
                </div>

                <div className={styles.categoryChart}>
                    <ResponsiveContainer width="100%" height={240} minWidth={0} minHeight={0}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#888' }}>Total Sales</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>${totalSales.toLocaleString()}</div>
                    </div>
                </div>

                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {categoryData.map((cat) => (
                        <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color }}></div>
                                <span style={{ fontSize: 12, color: '#555' }}>{cat.name}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>${cat.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

                {/* Traffic Sources */}
            {/* Alerts - Row 4 */}
            {lowStockProducts.length > 0 && (
                <div className={`${styles.chartCard} ${styles.span3}`}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.cardTitle} style={{ color: '#E74C3C' }}>Low Stock Alerts</h3>
                        </div>
                        <div className={styles.lowStockList}>
                            {lowStockProducts.map((p, idx) => {
                                return (
                                    <div key={idx} className={styles.lowStockItem}>
                                    <div className={styles.productInfo}>
                                        <div className={styles.productImage}>
                                            {p.image ? (
                                                <img 
                                                    src={getProductImageUrl(p.image)} 
                                                    alt={p.name} 
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.style.display = 'none';
                                                        e.target.parentNode.innerHTML = '<div class="' + styles.placeholderIcon + '">👕</div>';
                                                    }}
                                                />
                                            ) : (
                                                <div className={styles.placeholderIcon}>👕</div>
                                            )}
                                        </div>
                                        <div className={styles.productText}>
                                            <div className={styles.productName}>{p.name}</div>
                                            <div className={styles.stockCount}>Only {p.stock} left</div>
                                        </div>
                                    </div>
                                    <button 
                                        className={styles.restockBtn}
                                        onClick={() => handleRestock(p)}
                                    >
                                        Restock
                                    </button>
                                    </div>
                                );
                            })}
                        </div>
                </div>
            )}

            <TargetModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={saveTarget}
                currentTarget={monthlyTarget}
            />
        </motion.div>
    );
};

export default Dashboard;
