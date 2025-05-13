// src/pages/api/lands.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // join items → categories → nurseries to get display info
    const result = await pool.query(`
      SELECT
        i.itemid,
        i.name,
        i.description,
        i.price,
        i.survival_hrs,
        i.picture,
        c.name AS category,
        n.name AS nursery
      FROM items i
      JOIN categories c ON i.categoryid = c.categoryid
      JOIN nurseries n ON i.nurseryid = n.nurseryid
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching lands:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
