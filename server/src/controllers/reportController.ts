import { Request, Response } from 'express';
import pool from '../config/db';

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    // Group by month and sum total_amount for all bills
    const query = `
      SELECT 
        TO_CHAR(bill_month, 'YYYY-MM') as month,
        SUM(total_amount) as total_billed,
        SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END) as total_collected,
        SUM(CASE WHEN status = 'UNPAID' THEN total_amount ELSE 0 END) as total_outstanding
      FROM bills
      GROUP BY TO_CHAR(bill_month, 'YYYY-MM')
      ORDER BY month DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting revenue report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsageReport = async (req: Request, res: Response) => {
  try {
    // Group by month and sum units
    const query = `
      SELECT 
        TO_CHAR(bill_month, 'YYYY-MM') as month,
        SUM(units) as total_units
      FROM bills
      GROUP BY TO_CHAR(bill_month, 'YYYY-MM')
      ORDER BY month DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting usage report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomerSummaryReport = async (req: Request, res: Response) => {
  try {
    // Summary per customer: Total Billed, Total Paid, Current Arrears
    const query = `
      SELECT 
        c.id,
        c.full_name,
        c.account_number,
        COUNT(b.id) as total_bills,
        SUM(b.total_amount) as total_billed_amount,
        SUM(CASE WHEN b.status = 'PAID' THEN b.total_amount ELSE 0 END) as total_paid_amount,
        SUM(CASE WHEN b.status = 'UNPAID' THEN (b.total_amount - COALESCE(b.arrears, 0)) ELSE 0 END) as current_outstanding_principal
      FROM customers c
      LEFT JOIN bills b ON c.id = b.customer_id
      GROUP BY c.id
      ORDER BY c.full_name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting customer summary report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
