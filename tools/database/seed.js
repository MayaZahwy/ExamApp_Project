import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './connect.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSeed() {
  try {
    console.log('Reading schema.sql...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('Executing schema and seed data...');
    await pool.query(sql);
    console.log('Database schema created and seeded successfully.');
  } catch (error) {
    console.error('Database seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runSeed();
