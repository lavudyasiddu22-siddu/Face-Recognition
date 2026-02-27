// src/services/AuditLogger.js

/**
 * Enterprise Audit Logging Service
 * Handles persisting, streaming, and querying security events across the system.
 */

const API_BASE_URL = 'http://localhost:3001/api/logs';

export const getLogs = async () => {
    try {
        const res = await fetch(API_BASE_URL);
        if (!res.ok) throw new Error("Failed to fetch logs");
        return await res.json();
    } catch (err) {
        console.error("AuditLogger Error:", err);
        return [];
    }
};

export const logEvent = async ({
    action, // 'ACCESS_GRANTED', 'ACCESS_DENIED', 'SPOOF_ATTEMPT', 'MANUAL_OVERRIDE'
    identity = 'Unknown',
    confidenceScore = 0,
    livenessResult = false,
    deviceId = 'GATE-A4-TERM1',
    location = 'JFK Premium Lounge',
    ipAddress = '10.2.44.155',
    manualOverride = false,
    overrideReason = '',
    riskLevel = 'LOW'
}) => {
    try {
        const res = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action, identity, confidenceScore, livenessResult,
                deviceId, location, ipAddress, manualOverride,
                overrideReason, riskLevel
            })
        });
        return await res.json();
    } catch (err) {
        console.error("AuditLogger Error:", err);
        return null;
    }
};

export const exportLogsCSV = async () => {
    const logs = await getLogs();
    const headers = ['Timestamp', 'Action', 'Identity', 'Confidence', 'Liveness', 'Risk', 'Device', 'Location', 'Manual Override'];
    const rows = logs.map(l => [
        l.timestamp,
        l.action,
        l.identity,
        l.confidence_score,
        l.liveness_result ? 'Pass' : 'Fail',
        l.risk_level,
        l.device_id,
        l.location,
        l.manual_override ? 'Yes' : 'No'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
