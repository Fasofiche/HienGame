const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function migrate() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    for (const sql of statements) {
      try {
        await pool.query(sql);
      } catch (error) {
        if (!['42P07', '42710'].includes(error.code)) {
          throw error;
        }
      }
    }

    console.log('HienGame DB: migration terminée avec succès');
    await pool.end();
  } catch (error) {
    console.error('HienGame DB migration error:', error);
    process.exit(1);
  }
}

migrate();
