'use strict';

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin1234',
  database: process.env.DB_NAME || 'gridspark_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Optional SSL (for future use if you move to managed MySQL)
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});

// --- Verify DB connection on startup ---
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log('✅ MySQL connection established successfully.');
    conn.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1); // Exit container if DB is unreachable
  }
})();

// --- Graceful shutdown on SIGTERM (Docker stop/restart) ---
process.on('SIGTERM', async () => {
  try {
    await pool.end();
    console.log('🧹 MySQL pool closed gracefully (SIGTERM).');
    process.exit(0);
  } catch (err) {
    console.error('⚠️ Error closing MySQL pool:', err);
    process.exit(1);
  }
});

module.exports = pool;
