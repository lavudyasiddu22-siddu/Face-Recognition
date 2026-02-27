import React, { useState, useEffect } from 'react';
import { getLogs, exportLogsCSV } from '../services/AuditLogger';
import { Download, AlertCircle, ShieldCheck, ShieldAlert, Fingerprint } from 'lucide-react';
import './Logs.css';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await getLogs();
            if (Array.isArray(data)) {
                setLogs(data);
            }
        };

        // Initial load
        fetchLogs();

        // Simulate real-time polling
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log => {
        if (filter === 'ALL') return true;
        if (filter === 'DENIED' && log.action === 'ACCESS_DENIED') return true;
        if (filter === 'SPOOF' && log.action === 'SPOOF_ATTEMPT') return true;
        if (filter === 'MANUAL' && log.action === 'MANUAL_OVERRIDE') return true;
        return false;
    });

    const getLogIcon = (action) => {
        switch (action) {
            case 'ACCESS_GRANTED': return <ShieldCheck size={16} className="text-emerald" />;
            case 'ACCESS_DENIED': return <AlertCircle size={16} className="text-red" />;
            case 'SPOOF_ATTEMPT': return <ShieldAlert size={16} className="text-red" />;
            case 'MANUAL_OVERRIDE': return <Fingerprint size={16} className="text-cyan" />;
            default: return <AlertCircle size={16} />;
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'Unknown Time';
        const d = new Date(isoString);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour12: false })}`;
    };

    return (
        <div className="page-container logs-page">
            <div className="logs-header">
                <div>
                    <h2>Enterprise Audit Logs</h2>
                    <p className="text-muted text-sm mt-1">Real-time terminal view of all security events</p>
                </div>

                <div className="flex-center gap-4">
                    <div className="log-filters">
                        <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All Events</button>
                        <button className={`filter-btn ${filter === 'DENIED' ? 'active' : ''}`} onClick={() => setFilter('DENIED')}>Denied</button>
                        <button className={`filter-btn ${filter === 'SPOOF' ? 'active' : ''}`} onClick={() => setFilter('SPOOF')}>Spoofs</button>
                        <button className={`filter-btn ${filter === 'MANUAL' ? 'active' : ''}`} onClick={() => setFilter('MANUAL')}>Overrides</button>
                    </div>

                    <button className="btn btn-outline" onClick={exportLogsCSV}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="terminal-container glass-panel">
                <div className="terminal-header">
                    <div className="terminal-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <span className="terminal-title">live_tail // /var/log/auth.log</span>
                </div>

                <div className="terminal-body">
                    <table className="terminal-table">
                        <thead>
                            <tr>
                                <th>TIMESTAMP</th>
                                <th>ACTION</th>
                                <th>IDENTITY / RISK</th>
                                <th>LIVENESS %</th>
                                <th>DEVICE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className={`log-row risk-${(log.risk_level || 'LOW').toLowerCase()}`}>
                                    <td className="log-time">{formatTime(log.timestamp)}</td>
                                    <td className="log-action flex-center gap-2">
                                        {getLogIcon(log.action)}
                                        <span>{log.action}</span>
                                    </td>
                                    <td>
                                        {log.identity}
                                        {log.risk_level === 'HIGH' && <span className="risk-badge badge-high">HIGH RISK</span>}
                                    </td>
                                    <td className={log.liveness_result ? 'text-emerald' : 'text-red'}>
                                        {log.confidence_score}% {log.liveness_result ? '(Pass)' : '(Fail)'}
                                    </td>
                                    <td className="log-device">{log.device_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLogs.length === 0 && (
                        <div className="terminal-empty">No events matching filter.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Logs;
