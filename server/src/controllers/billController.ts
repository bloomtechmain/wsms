import { Request, Response } from 'express';
import pool from '../config/db';

const calculateBillAmount = async (units: number) => {
  const result = await pool.query('SELECT * FROM tariff_rates ORDER BY min_units ASC');
  const tariffs = result.rows;

  let total = 0;
  let prevLimit = 0;

  for (const tariff of tariffs) {
    if (units <= prevLimit) break;

    const slabLimit = tariff.max_units ?? Number.MAX_SAFE_INTEGER;
    const qty = Math.max(0, Math.min(units, slabLimit) - prevLimit);
    
    total += qty * Number(tariff.rate_per_unit);
    prevLimit = slabLimit;
  }

  return total;
};

export const generateBill = async (req: Request, res: Response) => {
  const { customer_id, reading_id } = req.body;
  const user = (req as any).user;

  try {
    const readingRes = await pool.query('SELECT * FROM meter_readings WHERE id = $1', [reading_id]);
    const reading = readingRes.rows[0];

    if (!reading) return res.status(404).json({ message: 'Reading not found' });

    // Calculate units
    const units = Number(reading.current_reading) - Number(reading.previous_reading);
    
    console.log(`Generating Bill for Customer ${customer_id}, Reading ID ${reading_id}`);
    console.log(`Units: ${units}`);

    const currentAmount = await calculateBillAmount(units);
    console.log(`Current Amount (Calculated): ${currentAmount}`);

    // Calculate arrears (unpaid bills)
    // We sum up the principal amount (total - arrears) of all UNPAID bills to avoid double counting
    console.log('Fetching arrears for customer:', customer_id);
    const arrearsRes = await pool.query(
      `SELECT SUM(total_amount - COALESCE(arrears, 0)) as total_arrears 
       FROM bills 
       WHERE customer_id = $1 AND status = 'UNPAID'`,
      [customer_id]
    );
    console.log('Arrears Query Result:', arrearsRes.rows[0]);
    const arrears = Number(arrearsRes.rows[0].total_arrears || 0);
    console.log(`Total Arrears: ${arrears}`);

    const totalAmount = currentAmount + arrears;
    console.log(`Final Total Amount: ${totalAmount}`);

    const billRes = await pool.query(
      `INSERT INTO bills (customer_id, reading_id, bill_month, units, total_amount, arrears, generated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customer_id, reading_id, reading.reading_month, units, totalAmount, arrears, user.id]
    );

    res.status(201).json(billRes.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating bill' });
  }
};

export const updateBillStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['PAID', 'UNPAID'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be PAID or UNPAID' });
  }

  try {
    const result = await pool.query(
      'UPDATE bills SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bill status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBills = async (req: Request, res: Response) => {
  const { customer_id } = req.query;
  
  try {
    let query = `
      SELECT b.*, c.full_name as customer_name, mr.current_reading 
      FROM bills b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN meter_readings mr ON b.reading_id = mr.id
    `;
    const params: any[] = [];

    if (customer_id) {
      query += ' WHERE b.customer_id = $1';
      params.push(customer_id);
    }

    query += ' ORDER BY b.bill_month DESC';

    const result = await pool.query(query, params);
    
    const bills = result.rows.map(bill => ({
      ...bill,
      customer: bill.customer_id ? { id: bill.customer_id, full_name: bill.customer_name } : null,
      reading: bill.reading_id ? { id: bill.reading_id, current_reading: bill.current_reading } : null
    }));
    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching bills' });
  }
};
