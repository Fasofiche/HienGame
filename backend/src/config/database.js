const { Pool } = require('pg');
require('dotenv').config();

console.log('DB CONFIG:', { host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER });
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || undefined,
});

pool.on('error', (err) => {
  console.error('Erreur PostgreSQL inattendue:', err);
});

module.exports = pool;
