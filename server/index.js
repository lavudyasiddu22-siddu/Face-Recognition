const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB and start server
let db;
initDB().then(database => {
    db = database;
    app.listen(PORT, () => {
        console.log(`Premium Guest Security Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to initialize database:", err);
});

// ============================================
// MEMBERS API
// ============================================

app.get('/api/members', async (req, res) => {
    try {
        const members = await db.all('SELECT * FROM members');
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/members', async (req, res) => {
    const { name, tier, phone_number, membership_number, expiry_date, embedding_ref, consent_signature, consent_date } = req.body;
    const id = `VIP-${Math.floor(Math.random() * 9000) + 1000}`;

    try {
        await db.run(`
      INSERT INTO members (id, name, tier, phone_number, membership_number, expiry_date, embedding_ref, consent_signature, consent_date, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [id, name, tier, phone_number, membership_number, expiry_date, embedding_ref, consent_signature, consent_date]);

        const newMember = await db.get('SELECT * FROM members WHERE id = ?', id);
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/members/:id/toggle', async (req, res) => {
    const { id } = req.params;
    try {
        const member = await db.get('SELECT active FROM members WHERE id = ?', id);
        if (!member) return res.status(404).json({ error: 'Member not found' });

        // Toggle active status (1 to 0 or 0 to 1)
        const newStatus = member.active ? 0 : 1;
        await db.run('UPDATE members SET active = ? WHERE id = ?', [newStatus, id]);

        res.json({ id, active: newStatus === 1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/members/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const member = await db.get('SELECT id FROM members WHERE id = ?', id);
        if (!member) return res.status(404).json({ error: 'Member not found' });

        await db.run('DELETE FROM members WHERE id = ?', id);
        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// LOGS API
// ============================================

app.get('/api/logs', async (req, res) => {
    try {
        // Return newest first
        const logs = await db.all('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 500');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/logs', async (req, res) => {
    const { action, identity, confidenceScore, livenessResult, deviceId, location, ipAddress, manualOverride, overrideReason, riskLevel } = req.body;

    const id = `evnt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();

    try {
        await db.run(`
      INSERT INTO logs (id, timestamp, action, identity, confidence_score, liveness_result, device_id, location, ip_address, manual_override, override_reason, risk_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id, timestamp, action, identity || 'Unknown', confidenceScore || 0,
            livenessResult ? 1 : 0, deviceId || 'GATE-A4-TERM1', location || 'JFK Premium Lounge',
            ipAddress || '10.2.44.155', manualOverride ? 1 : 0, overrideReason || '', riskLevel || 'LOW'
        ]);

        res.status(201).json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// VERIFICATION API (Live Biometric Matching)
// ============================================

// Helper to compute Euclidean distance between two 128D arrays
function euclideanDistance(arrA, arrB) {
    if (arrA.length !== arrB.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < arrA.length; i++) {
        sum += Math.pow(arrA[i] - arrB[i], 2);
    }
    return Math.sqrt(sum);
}

app.post('/api/verify', async (req, res) => {
    const { liveEmbedding, livenessPassed } = req.body;

    if (!livenessPassed) {
        return res.status(401).json({
            matched: false,
            reason: 'Liveness challenge failed',
            matchConfidence: 0
        });
    }

    // Simulate network processing and database lookup latency
    const latency = Math.floor(Math.random() * 200) + 120; // 120-320ms latency

    setTimeout(async () => {
        try {
            // 1. Fetch only ACTIVE members
            const activeMembers = await db.all('SELECT id, name, tier, embedding_ref, phone_number, membership_number, expiry_date FROM members WHERE active = 1');

            if (!activeMembers || activeMembers.length === 0) {
                return res.json({ matched: false, matchConfidence: 0, member: null, latencyMs: latency });
            }

            // 2. Perform Real Verification using Euclidean Distance
            // In our mock encryption, we appended metadata. To get the array back:
            let matchedMember = null;
            let highestConfidence = 0;
            let minDistance = Infinity;

            for (const member of activeMembers) {
                try {
                    // Hacky decryption for the hackathon prototype: extract the base64, decode, split by '_' and parse the JSON array
                    const encString = member.embedding_ref.replace('enc_aes256_', '');
                    const decoded = atob(encString);
                    const jsonPart = decoded.split('_')[0];
                    const storedEmbedding = JSON.parse(jsonPart); // The 128D array

                    const distance = euclideanDistance(liveEmbedding, storedEmbedding);

                    // If distance is less than 0.6, it's generally considered a match in face-api
                    if (distance < minDistance) {
                        minDistance = distance;
                        if (distance < 0.55) { // Strict threshold
                            matchedMember = member;
                            // Convert distance to a pseudo-percentage 0 to 100
                            highestConfidence = Math.max(0, Math.floor((1 - (distance / 0.8)) * 100));
                        }
                    }
                } catch (e) {
                    console.error("Error reading stored embedding for", member.id);
                }
            }

            if (matchedMember) {
                const today = new Date();
                const expiryDate = new Date(matchedMember.expiry_date);
                // Strip time portion for accurate date comparison
                today.setHours(0, 0, 0, 0);
                expiryDate.setHours(0, 0, 0, 0);

                if (matchedMember.expiry_date && expiryDate < today) {
                    res.json({
                        matched: false,
                        matchConfidence: highestConfidence > 99 ? 99 : highestConfidence,
                        reason: `Membership expired on ${matchedMember.expiry_date}`,
                        member: null,
                        latencyMs: latency
                    });
                } else {
                    res.json({
                        matched: true,
                        matchConfidence: highestConfidence > 99 ? 99 : highestConfidence,
                        member: matchedMember,
                        latencyMs: latency
                    });
                }
            } else {
                res.json({
                    matched: false,
                    matchConfidence: Math.floor(Math.random() * 30) + 40,
                    member: null,
                    latencyMs: latency
                });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }, latency);
});
