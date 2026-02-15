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

export const addReading = async (req: Request, res: Response) => {
  console.log('Received reading body:', req.body);
  const { customer_id, reading_month, previous_reading, current_reading } = req.body;
  const user = (req as any).user;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const units = Number(current_reading) - Number(previous_reading);
    
    // 1. Insert Meter Reading
    // units_consumed is generated, so we do NOT insert it
    // Ensure dates are properly formatted (YYYY-MM-DD)
    const formattedMonth = new Date(reading_month).toISOString().slice(0, 10);
    
    const readingResult = await client.query(
      `INSERT INTO meter_readings (customer_id, reading_month, previous_reading, current_reading, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer_id, formattedMonth, previous_reading, current_reading, user.id]
    );
    const reading = readingResult.rows[0];

    // 2. Calculate Bill Amount
    // We can use the returned units_consumed from the database if we selected it, 
    // or just use our calculated one for bill logic (they should be same)
    let unitsConsumed = Number(reading.units_consumed);
    
    // Fallback if units_consumed is not returned or invalid
    if (isNaN(unitsConsumed)) {
      unitsConsumed = Number(current_reading) - Number(previous_reading);
    }

    const amount = await calculateBillAmount(unitsConsumed);

    // 3. Calculate arrears (unpaid bills)
    // We sum up the principal amount (total - arrears) of all UNPAID bills to avoid double counting
    console.log('Fetching arrears for customer:', customer_id);
    const arrearsRes = await client.query(
      `SELECT bill_month, (total_amount - COALESCE(arrears, 0)) as principal 
       FROM bills 
       WHERE customer_id = $1 AND status = 'UNPAID'
       ORDER BY bill_month ASC`,
      [customer_id]
    );
    
    const arrearsBreakdown = arrearsRes.rows.map(row => ({
      month: row.bill_month,
      amount: Number(row.principal)
    }));

    const arrears = arrearsBreakdown.reduce((sum, item) => sum + item.amount, 0);
    console.log(`Total Arrears: ${arrears}`);

    const totalAmount = amount + arrears;
    console.log(`Final Total Amount: ${totalAmount}`);

    // 4. Generate Bill
    const billResult = await client.query(
      `INSERT INTO bills (customer_id, reading_id, bill_month, units, total_amount, arrears, generated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customer_id, reading.id, formattedMonth, unitsConsumed, totalAmount, arrears, user.id]
    );

    await client.query('COMMIT');

    const bill = {
      ...billResult.rows[0],
      arrears_breakdown: arrearsBreakdown
    };

    res.status(201).json({
      reading,
      bill
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding reading:', error);
    
    // Check for unique constraint violation (code 23505)
    if ((error as any).code === '23505') {
      return res.status(400).json({ message: 'Reading for this month already exists.' });
    }
    
    res.status(500).json({ message: 'Error adding reading and generating bill', details: (error as any).message });
  } finally {
    client.release();
  }
};

export const getReadings = async (req: Request, res: Response) => {
  const { customer_id } = req.query;
  
  try {
    let query = `
      SELECT mr.*, c.full_name as customer_name 
      FROM meter_readings mr 
      LEFT JOIN customers c ON mr.customer_id = c.id
    `;
    const params: any[] = [];

    if (customer_id) {
      query += ' WHERE mr.customer_id = $1';
      params.push(customer_id);
    }

    query += ' ORDER BY mr.reading_month DESC';

    const result = await pool.query(query, params);
    
    const readings = result.rows.map(reading => ({
      ...reading,
      customer: reading.customer_id ? { id: reading.customer_id, full_name: reading.customer_name } : null
    }));
    res.json(readings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching readings' });
  }
};

export const updateReading = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { current_reading } = req.body;
  const user = (req as any).user;

  // Check if user is admin
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can edit readings' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get the reading to be updated
    const readingRes = await client.query('SELECT * FROM meter_readings WHERE id = $1', [id]);
    if (readingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Reading not found' });
    }
    const reading = readingRes.rows[0];

    // 2. Check if this is the latest reading for the customer
    // We check if there exists any reading with a later month for the same customer
    const laterReadingRes = await client.query(
      'SELECT * FROM meter_readings WHERE customer_id = $1 AND reading_month > $2',
      [reading.customer_id, reading.reading_month]
    );

    if (laterReadingRes.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot edit past readings. Only the latest reading can be modified.' });
    }

    // 3. Calculate new units consumed
    const newUnits = Number(current_reading) - Number(reading.previous_reading);

    if (newUnits < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Current reading cannot be less than previous reading' });
    }

    // 4. Update the reading
    const updateRes = await client.query(
      'UPDATE meter_readings SET current_reading = $1, units_consumed = $2 WHERE id = $3 RETURNING *',
      [current_reading, newUnits, id]
    );

    await client.query('COMMIT');
    res.json(updateRes.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error updating reading' });
  } finally {
    client.release();
  }
};
