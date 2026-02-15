import pool from './config/db';

const seedDummyData = async () => {
  try {
    console.log('Seeding dummy data...');

    // Check columns
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'meter_readings'
    `);
    console.log('Columns in meter_readings:', cols.rows);

    const billsCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bills'
    `);
    console.log('Columns in bills:', billsCols.rows);

    // 1. Create Customer Group
    const groupRes = await pool.query(`
      INSERT INTO customer_groups (group_code, group_name, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (group_code) DO UPDATE SET group_name = EXCLUDED.group_name
      RETURNING id
    `, ['RES', 'Residential', 'Standard residential customers']);
    
    const groupId = groupRes.rows[0].id;
    console.log('Customer Group created:', groupId);

    // 2. Create Customers
    const customersData = [
      { code: 'CUST001', name: 'John Doe', meter: 'MTR-001', address: '123 Main St' },
      { code: 'CUST002', name: 'Jane Smith', meter: 'MTR-002', address: '456 Oak Ave' },
      { code: 'CUST003', name: 'Alice Johnson', meter: 'MTR-003', address: '789 Pine Rd' },
      { code: 'CUST004', name: 'Bob Brown', meter: 'MTR-004', address: '101 Maple Ln' },
      { code: 'CUST005', name: 'Charlie Davis', meter: 'MTR-005', address: '202 Birch Blvd' }
    ];

    const customerIds = [];

    for (const c of customersData) {
      const custRes = await pool.query(`
        INSERT INTO customers (customer_code, full_name, meter_number, address, group_id, account_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (customer_code) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id
      `, [c.code, c.name, c.meter, c.address, groupId, `ACC-${c.code}`]);
      customerIds.push(custRes.rows[0].id);
    }
    console.log('Customers created:', customerIds.length);

    // 3. Create Readings (Last Month)
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = lastMonthDate.toISOString().split('T')[0];
    
    for (const cid of customerIds) {
      const prevReading = Math.floor(Math.random() * 1000);
      const currentReading = prevReading + Math.floor(Math.random() * 50) + 10;
      const units = currentReading - prevReading;

      const readRes = await pool.query(`
        INSERT INTO meter_readings (customer_id, reading_month, previous_reading, current_reading)
        VALUES ($1, $2::date, $3, $4)
        ON CONFLICT (customer_id, reading_month) DO NOTHING
        RETURNING id
      `, [cid, lastMonth, prevReading, currentReading]);

      if (readRes.rows.length > 0) {
        // Create Bill
        const readingId = readRes.rows[0].id;
        const amount = units * 1.5; // $1.5 per unit
        
        await pool.query(`
          INSERT INTO bills (customer_id, reading_id, bill_month, units, total_amount, status)
          VALUES ($1, $2, $3::date, $4, $5, $6)
          ON CONFLICT (customer_id, bill_month) DO NOTHING
        `, [cid, readingId, lastMonth, units, amount, 'UNPAID']);
      }
    }
    console.log('Readings and Bills for last month created');

    console.log('Dummy data seeding completed!');
  } catch (error) {
    console.error('Error seeding dummy data:', error);
  } finally {
    await pool.end();
  }
};

seedDummyData();
