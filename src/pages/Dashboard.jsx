import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { ShieldAlert, UserCheck, UserX, Fingerprint, Activity, Clock } from 'lucide-react';
import './Dashboard.css';

// Mock Data
const entryTrends = [
    { time: '06:00', entries: 12 }, { time: '08:00', entries: 45 },
    { time: '10:00', entries: 120 }, { time: '12:00', entries: 85 },
    { time: '14:00', entries: 90 }, { time: '16:00', entries: 150 },
    { time: '18:00', entries: 70 }, { time: '20:00', entries: 30 }
];

const acceptanceData = [
    { name: 'Accepted', value: 850 },
    { name: 'Rejected', value: 45 },
    { name: 'Spoof', value: 12 }
];

const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        totalMembers: 15284,
        entriesToday: 850,
        failedAttempts: 45,
        spoofAttempts: 12,
        manualOverrides: 8,
        avgVerificationTime: 172
    });

    return (
        <div className="page-container dashboard-page">
            <div className="metrics-grid">
                <MetricCard title="Active Members" value={metrics.totalMembers.toLocaleString()} icon={<UserCheck />} color="cyan" />
                <MetricCard title="Entries Today" value={metrics.entriesToday} icon={<Activity />} color="emerald" />
                <MetricCard title="Failed Attempts" value={metrics.failedAttempts} icon={<UserX />} color="red" />
                <MetricCard title="Spoof Attempts" value={metrics.spoofAttempts} icon={<ShieldAlert />} color="red" />
                <MetricCard title="Manual Overrides" value={metrics.manualOverrides} icon={<Fingerprint />} color="cyan" />
                <MetricCard title="Avg Verif. Time" value={`${metrics.avgVerificationTime}ms`} icon={<Clock />} color="emerald" />
            </div>

            <div className="charts-grid">
                <div className="chart-card glass-panel">
                    <h3>Daily Entry Trend</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={entryTrends}>
                                <defs>
                                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#06B6D4' }}
                                />
                                <Area type="monotone" dataKey="entries" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorEntries)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card glass-panel">
                    <h3>Acceptance Ratio</h3>
                    <div className="chart-wrapper flex-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={acceptanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {acceptanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-legend">
                            {acceptanceData.map((item, i) => (
                                <div key={item.name} className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: COLORS[i] }}></span>
                                    <span className="legend-label">{item.name}</span>
                                    <span className="legend-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color }) => {
    return (
        <div className={`metric-card glass-panel glow-hover-${color}`}>
            <div className={`metric-icon text-${color} bg-${color}-subtle`}>
                {icon}
            </div>
            <div className="metric-details">
                <p className="metric-title">{title}</p>
                <p className="metric-value">{value}</p>
            </div>
        </div>
    );
};

export default Dashboard;
