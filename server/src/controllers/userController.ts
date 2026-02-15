import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT u.id, u.full_name, u.email, u.role_id, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id');
    const users = result.rows.map(user => ({
      ...user,
      role: { id: user.role_id, name: user.role_name }
    }));
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { full_name, email, password, role_id } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [full_name, email, hash, role_id]
    );
    const { password_hash, ...newUser } = result.rows[0];
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching roles' });
  }
};
