import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const run = async () => {
  try {
    const sqlPath = path.join(__dirname, 'sql/schema.sql');
    console.log('Reading SQL from:', sqlPath);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('SQL Preview:', sql.substring(0, 200));

    console.log('Running migration...');
    // We execute the whole SQL file.
    // Note: pg query might not support multiple statements unless configured?
    // Usually it does.
    await pool.query(sql);
    console.log('Migration completed successfully.');
  } catch (err: any) {
    if (err.code === '42P07') { // duplicate_table
        console.log('Tables already exist.');
    } else {
        console.error('Migration failed:', err);
    }
  } finally {
    await pool.end();
  }
};

run();
