import { Request, Response } from 'express';
import pool from '../config/db';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT g.*, u.full_name as manager_name 
      FROM customer_groups g 
      LEFT JOIN users u ON g.manager_id = u.id
    `);
    const groups = result.rows.map(group => ({
      ...group,
      manager: group.manager_id ? { id: group.manager_id, full_name: group.manager_name } : null
    }));
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching groups' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  const { group_code, group_name, description, manager_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO customer_groups (group_code, group_name, description, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [group_code, group_name, description, manager_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating group' });
  }
};
