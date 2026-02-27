const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.sqlite');

let dbInstance = null;

async function initDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('Connected to SQLite database.');

  // Initialize Tables
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tier TEXT DEFAULT 'Silver',
      phone_number TEXT,
      membership_number TEXT,
      expiry_date TEXT,
      embedding_ref TEXT NOT NULL,
      consent_signature TEXT NOT NULL,
      consent_date TEXT NOT NULL,
      active BOOLEAN DEFAULT 1
    );
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      action TEXT NOT NULL,
      identity TEXT,
      confidence_score REAL,
      liveness_result BOOLEAN,
      device_id TEXT,
      location TEXT,
      ip_address TEXT,
      manual_override BOOLEAN DEFAULT 0,
      override_reason TEXT,
      risk_level TEXT
    );
  `);

  // Seed initial member if empty
  const membersCount = await dbInstance.get('SELECT COUNT(*) as count FROM members');
  if (membersCount.count === 0) {
    console.log('Seeding initial members...');
    await dbInstance.run(`
      INSERT INTO members (id, name, tier, phone_number, membership_number, expiry_date, embedding_ref, consent_signature, consent_date, active)
      VALUES 
      ('VIP-7842', 'Eleanor Vance', 'Diamond', '+15551234567', 'PRM-00892', '2028-12-31', 'enc_aes256_mock_1', 'Eleanor Vance', '2023-11-12T10:00:00Z', 1),
      ('VIP-9011', 'Marcus Sterling', 'Gold', '+15559876543', 'PRM-11234', '2026-06-30', 'enc_aes256_mock_2', 'M. Sterling', '2024-01-05T14:30:00Z', 1)
    `);
  }

  // Seed initial logs if empty
  const logsCount = await dbInstance.get('SELECT COUNT(*) as count FROM logs');
  if (logsCount.count === 0) {
    console.log('Seeding initial logs...');
    const now = Date.now();
    for (let i = 0; i < 8; i++) {
      const isGranted = Math.random() > 0.1;
      await dbInstance.run(`
        INSERT INTO logs (id, timestamp, action, identity, confidence_score, liveness_result, device_id, location, ip_address, manual_override, override_reason, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `evnt_${now - (i * 3600000)}_${Math.random().toString(36).substr(2, 5)}`,
        new Date(now - (i * 3600000)).toISOString(),
        isGranted ? 'ACCESS_GRANTED' : 'SPOOF_ATTEMPT',
        isGranted ? `VIP-${Math.floor(Math.random() * 9000) + 1000}` : 'Unknown',
        Math.floor(Math.random() * 15) + 85,
        Math.random() > 0.1 ? 1 : 0,
        'GATE-A4-TERM1',
        'JFK Premium Lounge',
        '10.2.44.155',
        0,
        '',
        Math.random() > 0.9 ? 'MEDIUM' : 'LOW'
      ]);
    }
  }

  return dbInstance;
}

module.exports = {
  initDB
};
