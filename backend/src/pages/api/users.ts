import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.status(200).json(result.rows);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching users:', error); // 👈 This will print the full error
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
