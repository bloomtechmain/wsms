import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In a real app, verify hash. For this example, assuming stored password is hash
    // const match = await bcrypt.compare(password, user.password_hash);
    // User provided schema has password_hash.
    
    // NOTE: In the provided SQL, passwords might be plain text initially or we need to seed with hash.
    // I'll assume we compare with hash. If user enters 'postgres', we might fail if DB has plain text.
    // I'll implement bcrypt compare.
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, name: user.full_name, role: user.role_name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
