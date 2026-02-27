import React, { useState } from 'react';
import { Shield, Lock, Eye, Server, RefreshCw, Key } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState({
        livenessEnabled: true,
        encryptionEnabled: true,
        manualFallback: true,
        confidenceThreshold: 85,
        riskScoringLevel: 'HIGH',
        rateLimit: 5
    });

    const toggleSetting = (key) => setSettings({ ...settings, [key]: !settings[key] });

    return (
        <div className="page-container settings-page">
            <div className="settings-header">
                <h2>Security Governance panel</h2>
                <div className="security-grade">
                    <span>Overall Posture:</span>
                    {settings.livenessEnabled && settings.encryptionEnabled && settings.confidenceThreshold >= 80 ? (
                        <span className="badge badge-success" style={{ fontSize: '1rem', padding: '6px 12px' }}>A+ ENTERPRISE</span>
                    ) : (
                        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#FBBF24', border: '1px solid #FBBF24', fontSize: '1rem', padding: '6px 12px' }}>MODERATE</span>
                    )}
                </div>
            </div>

            <div className="settings-grid">
                <div className="settings-card glass-panel">
                    <div className="card-header border-cyan">
                        <Eye className="text-cyan" />
                        <h3>Biometric Engine</h3>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <h4>Active Liveness Detection</h4>
                            <p>Require physical reaction to prevent spoofing</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={settings.livenessEnabled} onChange={() => toggleSetting('livenessEnabled')} />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <h4>Confidence Threshold</h4>
                            <p>Minimum match percentage required for access</p>
                        </div>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="50"
                                max="99"
                                value={settings.confidenceThreshold}
                                onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseInt(e.target.value) })}
                                className="range-slider"
                            />
                            <span className="threshold-value {settings.confidenceThreshold >= 80 ? 'text-emerald' : 'text-red'}">
                                {settings.confidenceThreshold}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="settings-card glass-panel">
                    <div className="card-header border-cyan">
                        <Lock className="text-emerald" />
                        <h3>Data Security</h3>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <h4><Shield size={14} className="inline-icon text-emerald" /> AES-256 Embedding Encryption</h4>
                            <p>Encrypt all vector data at rest</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={settings.encryptionEnabled} onChange={() => toggleSetting('encryptionEnabled')} />
                            <span className="slider emerald-slider"></span>
                        </label>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <h4>Key Rotation Policy</h4>
                            <p>Auto-rotate encryption keys every 30 days</p>
                        </div>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            <RefreshCw size={12} /> Rotate Now
                        </button>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <h4>Manual Fallback Mode</h4>
                            <p>Allow staff overrides via OTP</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={settings.manualFallback} onChange={() => toggleSetting('manualFallback')} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-card glass-panel">
                    <div className="card-header border-cyan">
                        <Server className="text-cyan" />
                        <h3>System Infrastructure</h3>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <h4>Risk Scoring Level</h4>
                            <p>Heuristics leniency during low-traffic periods</p>
                        </div>
                        <select
                            className="modern-select"
                            value={settings.riskScoringLevel}
                            onChange={(e) => setSettings({ ...settings, riskScoringLevel: e.target.value })}
                            style={{ width: '120px' }}
                        >
                            <option>LOW</option>
                            <option>MEDIUM</option>
                            <option>HIGH</option>
                            <option>PARANOID</option>
                        </select>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <h4>Rate Limiting</h4>
                            <p>Max failed attempts per 5 mins</p>
                        </div>
                        <input
                            type="number"
                            className="modern-input"
                            style={{ width: '60px', textAlign: 'center' }}
                            value={settings.rateLimit}
                            onChange={(e) => setSettings({ ...settings, rateLimit: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            <div className="settings-footer">
                <button className="btn btn-primary"><Key size={18} /> Apply Security Policies</button>
            </div>
        </div>
    );
};

export default Settings;
