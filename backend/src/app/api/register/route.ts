// src/pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { hashPassword, signToken } from '../../../lib/auth';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    // is email taken?
    const exists = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (name,email,phone,password)
         VALUES ($1,$2,$3,$4)
       RETURNING userid,name,email,phone`,
      [name, email, phone, hashed]
    );

    const user = result.rows[0];
    const token = signToken(user.userid);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
