import fs from 'fs';
import path from 'path';
import pool from '../config/db';
import bcrypt from 'bcrypt';

/**
 * Auto-migration utility for Railway deployment
 * Checks if database tables exist, and if not, creates them and seeds initial data
 * This runs automatically on server startup, eliminating need for manual commands
 */

export async function autoMigrate(): Promise<void> {
  let client;
  try {
    console.log('🔍 Checking database status...');
    
    // Check if tables already exist by querying for the users table
    client = await pool.connect();
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tablesExist = tableCheck.rows[0].exists;
    
    if (tablesExist) {
      console.log('✅ Database tables already exist. Skipping migration.');
      return;
    }
    
    console.log('📦 Tables not found. Running initial migration...');
    
    // Read and execute schema.sql
    // Note: __dirname points to dist/utils, so we need to go back to src
    const sqlPath = path.join(__dirname, '../../src/sql/schema.sql');
    console.log(`📄 Reading schema from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('⚙️  Creating database tables...');
    await client.query(sql);
    console.log('✅ Database schema created successfully!');
    
    // Seed initial roles and users
    console.log('👤 Seeding initial users...');
    await seedInitialData(client);
    console.log('✅ Initial data seeded successfully!');
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error: any) {
    console.error('❌ Auto-migration error:', error.message);
    console.error('Stack:', error.stack);
    // Don't throw - allow server to start even if migration fails
    // This prevents deployment failures due to database issues
    console.log('⚠️  Server will continue startup despite migration error');
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Seeds initial roles and users into the database
 */
async function seedInitialData(client: any): Promise<void> {
  try {
    // Create roles
    const roles = ['Admin', 'Reader', 'Viewer'];
    
    for (const roleName of roles) {
      const roleCheck = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        [roleName]
      );
      
      if (roleCheck.rowCount === 0) {
        await client.query(
          'INSERT INTO roles (name) VALUES ($1)',
          [roleName]
        );
        console.log(`   ✓ Created role: ${roleName}`);
      }
    }
    
    // Create default users with hashed password
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Get role IDs
    const adminRoleRes = await client.query('SELECT id FROM roles WHERE name = $1', ['Admin']);
    const readerRoleRes = await client.query('SELECT id FROM roles WHERE name = $1', ['Reader']);
    const viewerRoleRes = await client.query('SELECT id FROM roles WHERE name = $1', ['Viewer']);
    
    // Create Admin user
    if (adminRoleRes.rowCount > 0) {
      const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', ['admin@wsms.com']);
      if (adminCheck.rowCount === 0) {
        await client.query(
          'INSERT INTO users (password_hash, email, full_name, role_id) VALUES ($1, $2, $3, $4)',
          [hashedPassword, 'admin@wsms.com', 'System Admin', adminRoleRes.rows[0].id]
        );
        console.log(`   ✓ Created Admin: admin@wsms.com / ${defaultPassword}`);
      }
    }
    
    // Create Reader user
    if (readerRoleRes.rowCount > 0) {
      const readerCheck = await client.query('SELECT id FROM users WHERE email = $1', ['reader@wsms.com']);
      if (readerCheck.rowCount === 0) {
        await client.query(
          'INSERT INTO users (password_hash, email, full_name, role_id) VALUES ($1, $2, $3, $4)',
          [hashedPassword, 'reader@wsms.com', 'Meter Reader', readerRoleRes.rows[0].id]
        );
        console.log(`   ✓ Created Reader: reader@wsms.com / ${defaultPassword}`);
      }
    }
    
    // Create Viewer user
    if (viewerRoleRes.rowCount > 0) {
      const viewerCheck = await client.query('SELECT id FROM users WHERE email = $1', ['viewer@wsms.com']);
      if (viewerCheck.rowCount === 0) {
        await client.query(
          'INSERT INTO users (password_hash, email, full_name, role_id) VALUES ($1, $2, $3, $4)',
          [hashedPassword, 'viewer@wsms.com', 'System Viewer', viewerRoleRes.rows[0].id]
        );
        console.log(`   ✓ Created Viewer: viewer@wsms.com / ${defaultPassword}`);
      }
    }
    
    console.log('   ⚠️  SECURITY: Change default passwords after first login!');
    
  } catch (error: any) {
    console.error('❌ Error seeding initial data:', error.message);
    throw error;
  }
}
