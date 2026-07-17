import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/exam_app';

const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  connectionString.includes('supabase.com') ||
  connectionString.includes('render.com') ||
  process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('🔌 Database connected successfully at:', res.rows[0].now);
  }
});

export default pool;
