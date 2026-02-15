import { Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const seedRolesAndUsers = async () => {
  try {
    await client.connect();

    // 1. Create Roles
    console.log('Seeding Roles...');
    // Upsert roles (using INSERT ON CONFLICT if ID was primary, but here we just check by name)
    // Actually, we'll just check existence.
    const roles = ['Admin', 'Reader', 'Viewer'];
    
    for (const role of roles) {
      const res = await client.query('SELECT id FROM roles WHERE name = $1', [role]);
      if (res.rowCount === 0) {
        // Try inserting with description, if fails fallback to just name
        try {
          await client.query('INSERT INTO roles (name, description) VALUES ($1, $2)', [role, `${role} Role`]);
        } catch (e) {
           await client.query('INSERT INTO roles (name) VALUES ($1)', [role]);
        }
        console.log(`Created role: ${role}`);
      }
    }

    // 2. Create Users
    console.log('Seeding Users...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Admin User
    const adminRoleRes = await client.query('SELECT id FROM roles WHERE name = $1', ['Admin']);
    if (adminRoleRes.rowCount && adminRoleRes.rowCount > 0) {
      const adminRoleId = adminRoleRes.rows[0].id;
      const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', ['admin@wsms.com']);
      if (!adminCheck.rowCount || adminCheck.rowCount === 0) {
        await client.query(
          `INSERT INTO users (password_hash, email, full_name, role_id) 
           VALUES ($1, $2, $3, $4)`,
          [hashedPassword, 'admin@wsms.com', 'System Admin', adminRoleId]
        );
        console.log('Created Admin user: admin@wsms.com / 123456');
      }
    }

    // Reader User
    const readerRoleRes = await client.query('SELECT id FROM roles WHERE name = $1', ['Reader']);
    if (readerRoleRes.rowCount && readerRoleRes.rowCount > 0) {
      const readerRoleId = readerRoleRes.rows[0].id;
      const readerCheck = await client.query('SELECT id FROM users WHERE email = $1', ['reader@wsms.com']);
      if (!readerCheck.rowCount || readerCheck.rowCount === 0) {
        await client.query(
          `INSERT INTO users (password_hash, email, full_name, role_id) 
           VALUES ($1, $2, $3, $4)`,
          [hashedPassword, 'reader@wsms.com', 'Meter Reader', readerRoleId]
        );
        console.log('Created Reader user: reader@wsms.com / 123456');
      }
    }

  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    await client.end();
  }
};

seedRolesAndUsers();
