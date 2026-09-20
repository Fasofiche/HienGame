const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function migrate() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, '../src/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('HienGame DB: schema créé avec succès');
    await pool.end();
  } catch (error) {
    console.error('HienGame DB migration error:', error);
    process.exit(1);
  }
}

migrate();
