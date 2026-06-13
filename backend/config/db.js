const { Pool } = require('pg');
require('dotenv').config();

// 🛠️ THE EXACT PRODUCTION FIX: Swapped split parameters for a centralized connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // 🛠️ CRUCIAL FOR CLOUD ENVIRONMENT (Neon + Vercel):
  ssl: {
    rejectUnauthorized: false // Forces Neon to accept secure serverless handshakes safely
  },
  
  max: 10, // Prevents serverless functions from flooding your pool connections
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('PostgreSQL database connected successfully via cloud nodes.');
});

// Reuses your exact existing query module export structure so no other backend files break
module.exports = {
  query: (text, params) => pool.query(text, params),
};
