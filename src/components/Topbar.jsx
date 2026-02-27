import React, { useState, useEffect } from 'react';
import { Cloud, Server, Cpu, Bell, Activity } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
    const [latency, setLatency] = useState(42);

    // Simulate network latency fluctuations
    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(prev => {
                const variance = Math.floor(Math.random() * 11) - 5;
                let next = prev + variance;
                if (next < 20) next = 20;
                if (next > 150) next = 150;
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="topbar glass-panel">
            <div className="topbar-left">
                <h2 className="page-title">Command Center</h2>
            </div>

            <div className="topbar-right">
                {/* System metrics */}
                <div className="metric-badge">
                    <Cloud size={16} className="text-cyan" />
                    <span>Synced: 15,284</span>
                </div>

                <div className="metric-badge">
                    <Cpu size={16} className="text-emerald" />
                    <span>v3.2.0 (FaceNet)</span>
                </div>

                <div className="metric-badge">
                    <Server size={16} className={latency > 100 ? "text-red" : "text-cyan"} />
                    <span>{latency}ms</span>
                </div>

                <div className="metric-badge">
                    <Activity size={16} className="text-emerald" />
                    <span>SYS: HIGH</span>
                </div>

                <div className="divider"></div>

                {/* Alerts / Profile */}
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <div className="admin-profile">
                    <div className="admin-avatar">
                        <ShieldCheckIcon />
                    </div>
                    <div className="admin-info">
                        <span className="admin-name">SysAdmin</span>
                        <span className="admin-role">Lvl 4 Clearance</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
);

export default Topbar;
