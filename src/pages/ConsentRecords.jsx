import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, CheckSquare, XSquare, FileText } from 'lucide-react';

const ConsentRecords = () => {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/members')
            .then(res => res.json())
            .then(data => setRecords(data))
            .catch(err => console.error(err));
    }, []);

    const toggleConsent = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/api/members/${id}/toggle`, { method: 'PUT' });
            if (res.ok) {
                const updated = await res.json();
                setRecords(records.map(r => r.id === id ? { ...r, active: updated.active } : r));
            }
        } catch (err) {
            console.error("Failed to toggle consent:", err);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    return (
        <div className="page-container members-page">
            <div className="header-actions">
                <div>
                    <h2>Biometric Consent Records</h2>
                    <p className="text-muted text-sm mt-1">
                        <ShieldCheck size={14} className="text-emerald inline-icon" />
                        Compliance Tracking & Revocation Management
                    </p>
                </div>
            </div>

            <div className="table-container glass-panel">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Member ID</th>
                            <th>Member Name</th>
                            <th>Digital Signature</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(r => (
                            <tr key={r.id} className={!r.active ? 'opacity-50' : ''}>
                                <td className="font-mono text-cyan">{r.id}</td>
                                <td>{r.name}</td>
                                <td className="signature-font text-cyan">{r.consent_signature}</td>
                                <td className="text-sm text-secondary"><Calendar size={12} className="inline-icon" /> {formatDate(r.consent_date)}</td>
                                <td>
                                    {r.active
                                        ? <span className="badge badge-success">Valid</span>
                                        : <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>Revoked</span>
                                    }
                                </td>
                                <td>
                                    <button
                                        className={`btn ${r.active ? 'btn-danger' : 'btn-outline'}`}
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                        onClick={() => toggleConsent(r.id)}
                                    >
                                        {r.active ? <XSquare size={14} /> : <CheckSquare size={14} />}
                                        {r.active ? 'Revoke' : 'Reinstate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {records.length === 0 && (
                    <div className="p-8 text-center text-secondary">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No consent records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsentRecords;
