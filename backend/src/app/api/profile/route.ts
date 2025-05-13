import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import { verifyToken, hashPassword } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = auth.split(' ')[1];

  let userId: number;
  try {
    ({ userId } = verifyToken(token));
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (req.method === 'GET') {
    // fetch profile
    const result = await pool.query(
      'SELECT userid, name, email, phone FROM users WHERE userid = $1',
      [userId]
    );
    return res.status(200).json(result.rows[0]);
  }

  if (req.method === 'PATCH') {
    const { name, phone, password } = req.body;
    const updates = [];
    const params: any[] = [];
    let idx = 1;

    if (name) {
      updates.push(`name = $${idx++}`);
      params.push(name);
    }
    if (phone) {
      updates.push(`phone = $${idx++}`);
      params.push(phone);
    }
    if (password) {
      const hashed = await hashPassword(password);
      updates.push(`password = $${idx++}`);
      params.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE userid = $${idx}`;
    await pool.query(sql, params);
    return res.status(200).json({ message: 'Profile updated' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
