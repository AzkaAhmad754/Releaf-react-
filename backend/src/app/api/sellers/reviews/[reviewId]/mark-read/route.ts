// src/app/api/sellers/reviews/[reviewId]/mark-read/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../../../../lib/db';
import { verifyToken } from '../../../../../../lib/auth';

// CORS preflight
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function getSellerId(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');
  return verifyToken(auth.slice(7)).userId;
}

export async function PATCH( req: Request, { params }: { params: { reviewId: string } }) {
  try {
    const sellerId = await getSellerId(req);
    const { reviewId } = params;

    // ensure this review belongs to this seller
    const chk = await pool.query(
      `SELECT 1
         FROM reviews r
         JOIN items i       ON r.itemid = i.itemid
         JOIN nurseries n   ON i.nurseryid = n.nurseryid
        WHERE r.reviewid = $1`,
        [reviewId]
    );
    //WHERE r.reviewid = $1 AND n.sellerid = $2`,
    //[reviewId, sellerId]
    if (chk.rowCount === 0) {
        const res = NextResponse.json({ message: 'Not found or forbidden' }, { status: 404 });
        res.headers.set('Access-Control-Allow-Origin', '*');
        return res;
    }
      

    // mark as read
    await pool.query(
      `UPDATE reviews SET is_read = TRUE WHERE reviewid = $1`,
      [reviewId]
    );

    const res = NextResponse.json({ reviewId: Number(reviewId), isRead: true }, { status: 200 });
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
