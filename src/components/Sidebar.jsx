import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ScanFace,
    Terminal,
    ShieldCheck,
    FileSignature,
    Network,
    Bot
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/live-entry', label: 'Live Entry', icon: ScanFace },
    { path: '/members', label: 'Members', icon: Users },
    { path: '/logs', label: 'Audit Logs', icon: Terminal },
    { path: '/consent-records', label: 'Consent Records', icon: FileSignature },
    { path: '/settings', label: 'Security Settings', icon: ShieldCheck },
    { path: '/architecture', label: 'System Architecture', icon: Network },
    { path: '/ai-agent', label: 'AI Assistant', icon: Bot },
];

const Sidebar = () => {
    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <div className="logo-icon pulse-cyan">
                    <ScanFace size={28} className="text-cyan" />
                </div>
                <div>
                    <h1 className="brand-title text-gradient-cyan">PREMIUM GUEST</h1>
                    <p className="brand-subtitle">Biometric Security OS</p>
                </div>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="system-status">
                    <div className="status-indicator"></div>
                    <div>
                        <p className="status-text">SYSTEM SECURE</p>
                        <p className="status-subtext">Active Monitoring</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
