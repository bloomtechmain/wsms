import { Request, Response } from 'express';
import pool from '../config/db';

export const getCustomers = async (req: Request, res: Response) => {
  const { group_id } = req.query;
  
  try {
    let query = `
      SELECT c.*, g.group_name 
      FROM customers c 
      LEFT JOIN customer_groups g ON c.group_id = g.id
    `;
    const params: any[] = [];

    if (group_id) {
      query += ' WHERE c.group_id = $1';
      params.push(group_id);
    }

    const result = await pool.query(query, params);
    
    const customers = result.rows.map(customer => ({
      ...customer,
      group: customer.group_id ? { id: customer.group_id, group_name: customer.group_name } : null
    }));

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT c.*, g.group_name, g.group_code
      FROM customers c 
      LEFT JOIN customer_groups g ON c.group_id = g.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const customer = result.rows[0];
    const formattedCustomer = {
      ...customer,
      group: customer.group_id ? { id: customer.group_id, group_name: customer.group_name, group_code: customer.group_code } : null
    };

    res.json(formattedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { customer_code, account_number, full_name, address, phone, meter_number, group_id, new_group } = req.body;
    
    await client.query('BEGIN');

    // Validate uniqueness
    const existingCheck = await client.query(
      `SELECT id FROM customers WHERE customer_code = $1 OR meter_number = $2 OR ($3::text IS NOT NULL AND account_number = $3)`,
      [customer_code, meter_number, account_number]
    );

    if (existingCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Customer with this code, account number, or meter number already exists' });
    }

    let finalGroupId = group_id ? Number(group_id) : null;

    // Handle new group creation
    if (new_group) {
      const groupCheck = await client.query(
        'SELECT id FROM customer_groups WHERE group_code = $1',
        [new_group.group_code]
      );

      if (groupCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Group code already exists' });
      }

      const newGroupResult = await client.query(
        'INSERT INTO customer_groups (group_code, group_name, description, is_active) VALUES ($1, $2, $3, true) RETURNING id',
        [new_group.group_code, new_group.group_name, new_group.description]
      );
      finalGroupId = newGroupResult.rows[0].id;
    }

    const customerResult = await client.query(
      `INSERT INTO customers 
       (customer_code, account_number, full_name, address, phone, meter_number, group_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [customer_code, account_number, full_name, address, phone, meter_number, finalGroupId]
    );

    await client.query('COMMIT');
    
    // Fetch complete data with group for response
    const customer = customerResult.rows[0];
    if (finalGroupId) {
        const groupRes = await client.query('SELECT * FROM customer_groups WHERE id = $1', [finalGroupId]);
        customer.group = groupRes.rows[0];
    }

    res.status(201).json(customer);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Error creating customer' });
  } finally {
    client.release();
  }
};
