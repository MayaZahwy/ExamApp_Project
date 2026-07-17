import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is missing. Set it in the repository root .env file.');
  process.exit(1);
}

const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  databaseUrl.includes('supabase') ||
  process.env.NODE_ENV === 'production';

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

const migrationFile = process.argv[2] || '001_add_results_published.sql';
const migrationPath = path.resolve(__dirname, 'migrations', migrationFile);

async function run() {
  const sql = fs.readFileSync(migrationPath, 'utf8');

  await client.connect();
  console.log(`Running migration: ${migrationFile}`);
  await client.query(sql);
  console.log('Migration completed.');
  await client.end();
}

run().catch(async (error) => {
  console.error('Migration failed:', error.message);
  try {
    await client.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
