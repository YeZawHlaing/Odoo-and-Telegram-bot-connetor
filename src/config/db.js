const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const DB_NAME = process.env.DB_NAME || 'telegram_media_db';

const pool = mysql.createPool({
  ...DB_CONFIG,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initializeDatabase() {
  // 1. Connect without specifying a database so we can create it if missing
  const connection = await mysql.createConnection(DB_CONFIG);
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`[DB] Database '${DB_NAME}' is ready.`);
  } finally {
    await connection.end();
  }

  // 2. Create the schema table inside the newly ensured database
  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      media_id VARCHAR(32) NOT NULL UNIQUE,
      odoo_model VARCHAR(100) NOT NULL,
      odoo_record_id VARCHAR(50) NOT NULL,
      telegram_file_id VARCHAR(255) NOT NULL,
      telegram_unique_id VARCHAR(100) DEFAULT NULL,
      mime_type VARCHAR(50) DEFAULT 'image/jpeg',
      file_size INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_odoo_record (odoo_model, odoo_record_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("[DB] Table 'media_files' is ready.");
}

module.exports = { pool, initializeDatabase };