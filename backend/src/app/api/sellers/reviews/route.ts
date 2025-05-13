// src/app/api/sellers/reviews/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { verifyToken } from '../../../../lib/auth';

// CORS preflight
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function getSellerId(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');
  return verifyToken(auth.slice(7)).userId;
}

export async function GET(req: Request) {
  try {
    const sellerId = await getSellerId(req);

    // join reviews → items → nurseries → sellers, and join users & items for names
    const { rows } = await pool.query(
      `SELECT
         r.reviewid           AS id,
         r.itemid             AS "productId",
         i.name               AS "productName",
         r.userid             AS "userId",
         u.name               AS "userName",
         r.rating,
         r.description,
         r.heading,
         r.created_at         AS date,
         r.is_read            AS "isRead"
       FROM reviews r
       JOIN items i       ON r.itemid = i.itemid
       JOIN users u       ON r.userid = u.userid
       JOIN nurseries n   ON i.nurseryid = n.nurseryid
       WHERE n.sellerid = $1
       ORDER BY r.created_at DESC`,
      [sellerId]
    );

    const res = NextResponse.json(rows, { status: 200 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : 500;
    const res = NextResponse.json({ message: err.message }, { status });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
  }
}
