// src/pages/api/rent.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import { verifyToken } from '../../lib/auth';

type CartItem = { itemid: number; quantity: number; };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // authenticate
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  let userId: number;
  try {
    ({ userId } = verifyToken(auth.split(' ')[1]));
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const { items } = req.body as { items: CartItem[] };
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items to rent' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) create order
    const total = items.reduce((sum, it) => sum + it.quantity * 0 /*price filler*/, 0);
    const orderRes = await client.query(
      'INSERT INTO orders (userid, totalamount) VALUES ($1, $2) RETURNING orderid',
      [userId, total]
    );
    const orderId = orderRes.rows[0].orderid;

    // 2) group by nursery
    const byNursery = items.reduce((acc, it) => {
      acc[it.itemid] = (acc[it.itemid]||0) + it.quantity;
      return acc;
    }, {} as Record<number, number>);

    // NOTE: for simplicity we’re skipping grouping by nursery,
    // but you could query each item’s nurseryid and group accordingly.

    // 3) insert into order_nursery (one per order)
    const onRes = await client.query(
      'INSERT INTO order_nursery (orderid, nurseryid, subtotal) VALUES ($1, $2, $3) RETURNING ordernurseryid',
      [orderId, /*nurseryid*/ 1, total]
    );
    const onId = onRes.rows[0].ordernurseryid;

    // 4) insert order_details
    for (const { itemid, quantity } of items) {
      // fetch current price
      const { rows } = await client.query('SELECT price FROM items WHERE itemid = $1', [itemid]);
      const price = rows[0].price;
      await client.query(
        'INSERT INTO order_details (ordernurseryid, itemid, quantity, price_at_order) VALUES ($1,$2,$3,$4)',
        [onId, itemid, quantity, price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Rent error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    client.release();
  }
}
