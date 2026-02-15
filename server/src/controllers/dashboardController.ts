import { Request, Response } from 'express';
import pool from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Total Customers
    const customerCount = await pool.query('SELECT COUNT(*) FROM customers');
    
    // 2. Monthly Consumption (Current Month)
    // Assuming generated_at or reading_date is used. Let's check readings table.
    // We'll just sum all for now or check latest readings.
    const consumption = await pool.query('SELECT SUM(units_consumed) FROM meter_readings');

    // 3. Revenue (This Month / Total)
    const revenue = await pool.query('SELECT SUM(total_amount) FROM bills');

    // 4. Pending Bills
    const pendingBills = await pool.query("SELECT COUNT(*) FROM bills WHERE status = 'UNPAID' OR status = 'Pending'");

    // 5. Recent Readings (Limit 5)
    const recentReadings = await pool.query(`
      SELECT r.*, c.full_name as customer_name 
      FROM meter_readings r 
      JOIN customers c ON r.customer_id = c.id 
      ORDER BY r.created_at DESC LIMIT 5
    `);

    // 6. Recent Bills (Limit 5)
    const recentBills = await pool.query(`
      SELECT b.*, c.full_name as customer_name 
      FROM bills b 
      JOIN customers c ON b.customer_id = c.id 
      ORDER BY b.generated_at DESC LIMIT 5
    `);

    res.json({
      totalCustomers: customerCount.rows[0].count,
      totalConsumption: consumption.rows[0].sum || 0,
      totalRevenue: revenue.rows[0].sum || 0,
      pendingBills: pendingBills.rows[0].count,
      recentReadings: recentReadings.rows,
      recentBills: recentBills.rows
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
