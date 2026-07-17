import pool from './connect.js';

async function checkDatabase() {
  try {
    console.log('=== Database status ===\n');

    const ping = await pool.query('SELECT NOW() AS now, current_database() AS db');
    console.log('Connected to:', ping.rows[0].db);
    console.log('Server time:', ping.rows[0].now, '\n');

    const tablesResult = await pool.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
    );
    const tables = tablesResult.rows.map((row) => row.tablename);

    if (tables.length === 0) {
      console.log('No tables found — run schema.sql in Supabase SQL Editor.');
      return;
    }

    console.log('Public tables:', tables.join(', '), '\n');

    let total = 0;
    for (const table of tables) {
      const countResult = await pool.query(
        `SELECT COUNT(*)::int AS count FROM ${table}`,
      );
      const count = countResult.rows[0].count;
      total += count;
      console.log(`${table}: ${count} row(s)`);
    }

    console.log(`\nTotal rows: ${total}`);
    console.log(total === 0 ? 'Tables exist but no data yet.' : 'Database is ready.');
  } catch (error) {
    console.error('Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkDatabase();
