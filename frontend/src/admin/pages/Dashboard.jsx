import React from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { BiDollar, BiCart, BiUser, BiDotsHorizontalRounded } from 'react-icons/bi';
import styles from './Dashboard.module.css';

// Mock Data
const revenueData = [
    { name: '12 Aug', revenue: 4000, order: 2400 },
    { name: '13 Aug', revenue: 3000, order: 1398 },
    { name: '14 Aug', revenue: 2000, order: 9800 },
    { name: '15 Aug', revenue: 2780, order: 3908 },
    { name: '16 Aug', revenue: 1890, order: 4800 },
    { name: '17 Aug', revenue: 2390, order: 3800 },
    { name: '18 Aug', revenue: 3490, order: 4300 },
    { name: '19 Aug', revenue: 3000, order: 4100 },
];

const categoryData = [
    { name: 'Electronics', value: 1200000, color: '#FF8800' },
    { name: 'Fashion', value: 950000, color: '#FFBB73' },
    { name: 'Home & Kitchen', value: 750000, color: '#FFDCA8' },
    { name: 'Beauty', value: 500000, color: '#F5F6FA' },
];

const targetData = [
    { name: 'Achieved', value: 85, color: '#FF8800' },
    { name: 'Remaining', value: 15, color: '#F0F0F0' },
];

const trafficData = [
    { name: 'Direct', value: 40 },
    { name: 'Organic', value: 30 },
    { name: 'Social', value: 15 },
    { name: 'Referral', value: 10 },
    { name: 'Email', value: 5 },
];

const Dashboard = () => {
    return (
        <motion.div
            className={styles.dashboardContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Left Column */}
            <div className={styles.leftColumn}>

                {/* Row 1: Stats */}
                <div className={styles.statsGrid}>
                    {/* Sales */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span>Total Sales</span>
                            <div className={`${styles.iconCircle} ${styles.bgOrange}`}>
                                <BiDollar />
                            </div>
                        </div>
                        <div className={styles.statsValue}>$983,410</div>
                        <div className={styles.statsChange}>
                            <span className={styles.textGreen}>+3.34%</span> vs last week
                        </div>
                    </div>

                    {/* Orders */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span>Total Orders</span>
                            <div className={`${styles.iconCircle} ${styles.bgGray}`}>
                                <BiCart />
                            </div>
                        </div>
                        <div className={styles.statsValue}>58,375</div>
                        <div className={styles.statsChange}>
                            <span className={styles.textRed}>-2.89%</span> vs last week
                        </div>
                    </div>

                    {/* Visitors */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span>Total Visitors</span>
                            <div className={`${styles.iconCircle} ${styles.bgGray}`}>
                                <BiUser />
                            </div>
                        </div>
                        <div className={styles.statsValue}>237,782</div>
                        <div className={styles.statsChange}>
                            <span className={styles.textGreen}>+8.02%</span> vs last week
                        </div>
                    </div>
                </div>

                {/* Row 2: Charts */}
                <div className={styles.chartsRow}>
                    {/* Revenue Analytics */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.cardTitle}>Revenue Analytics</h3>
                            <button className={`${styles.timeFilter} ${styles.active}`}>Last 8 Days</button>
                        </div>
                        <div style={{ height: 250, width: '100%' }}>
                            <ResponsiveContainer>
                                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF8800" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#FF8800" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ea6b9', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ea6b9', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#FF8800" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    <Area type="monotone" dataKey="order" stroke="#FFDCA8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Target */}
                    <div className={styles.chartCard} style={{ textAlign: 'center' }}>
                        <div className={styles.chartHeader} style={{ justifyContent: 'space-between' }}>
                            <h3 className={styles.cardTitle}>Monthly Target</h3>
                            <BiDotsHorizontalRounded size={24} color="#999" />
                        </div>

                        <div style={{ position: 'relative', height: 160 }}>
                            <ResponsiveContainer>
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
                                        {targetData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>85%</div>
                                <div style={{ fontSize: '12px', color: '#27AE60' }}>+8.02% from last month</div>
                            </div>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <p style={{ fontSize: 14, fontWeight: 600 }}>Great Progress! 🎉</p>
                            <p style={{ fontSize: 12, color: '#777', marginTop: 4 }}>
                                Our achievement increased by $200,000; let's reach 100% next month.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Row 3: Active User & Conversion - For brevity mocking simplistically */}
                <div className={styles.bottomRow}>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.cardTitle}>Active User</h3>
                            <BiDotsHorizontalRounded />
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700 }}>2,758</div>
                        <div className={styles.textGreen} style={{ fontSize: 12, marginBottom: 20 }}>+8.02% from last month</div>

                        {/* Simple Bars for Country */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { n: 'United States', v: 36 },
                                { n: 'United Kingdom', v: 24 },
                                { n: 'Indonesia', v: 17.5 },
                                { n: 'Russia', v: 15 }
                            ].map((c) => (
                                <div key={c.n}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span>{c.n}</span>
                                        <span>{c.v}%</span>
                                    </div>
                                    <div style={{ height: 6, background: '#F0F0F0', borderRadius: 3 }}>
                                        <div style={{ width: `${c.v * 2}%`, height: '100%', background: '#FFBB73', borderRadius: 3 }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.cardTitle}>Conversion Rate</h3>
                            <button className={`${styles.timeFilter} ${styles.active}`}>This Week</button>
                        </div>

                        <div className={styles.conversionContainer}>
                            {[
                                { label: 'Product Views', val: '25,000', change: '+9%', h: 40 },
                                { label: 'Add to Cart', val: '12,000', change: '+6%', h: 60 },
                                { label: 'Checkout', val: '8,500', change: '+4%', h: 30 },
                                { label: 'Purchase', val: '6,200', change: '+7%', h: 20 },
                                { label: 'Abandoned', val: '3,000', change: '-5%', h: 10, red: true }
                            ].map((step, i) => (
                                <div key={i} className={styles.barGroup}>
                                    <div style={{ textAlign: 'center', marginBottom: 5 }}>
                                        <div style={{ fontWeight: 700 }}>{step.val}</div>
                                        <div style={{ fontSize: 10, color: step.red ? 'red' : 'green' }}>{step.change}</div>
                                    </div>
                                    <div
                                        className={styles.bar}
                                        style={{ height: `${step.h * 1.5}px` }}
                                    />
                                    <span style={{ fontSize: 10, color: '#888', textAlign: 'center', width: 60 }}>{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column Layout */}
            <div className={styles.rightColumn}>
                {/* Top Categories */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.cardTitle}>Top Categories</h3>
                        <span style={{ fontSize: 12, color: '#888', cursor: 'pointer' }}>See All</span>
                    </div>

                    <div style={{ height: 200, position: 'relative' }}>
                        <ResponsiveContainer>
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
                            <div style={{ fontSize: 18, fontWeight: 700 }}>$3.4M</div>
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
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.cardTitle}>Traffic Sources</h3>
                        <BiDotsHorizontalRounded />
                    </div>

                    <div style={{ display: 'flex', height: 40, borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                        <div style={{ width: '40%', background: '#FFDFC0' }}></div>
                        <div style={{ width: '30%', background: '#FFEACC' }}></div>
                        <div style={{ width: '20%', background: '#FFF5E0' }}></div>
                        <div style={{ width: '10%', background: '#FF8800' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { l: 'Direct Traffic', v: '40%' },
                            { l: 'Organic Search', v: '30%' },
                            { l: 'Social Media', v: '15%' },
                            { l: 'Referral Traffic', v: '10%' },
                            { l: 'Email Campaigns', v: '5%' },
                        ].map((t) => (
                            <div key={t.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF8800' }}></div>
                                    {t.l}
                                </span>
                                <span style={{ fontWeight: 600 }}>{t.v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
