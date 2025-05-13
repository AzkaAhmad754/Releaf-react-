import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';
import { verifyToken } from '../../../../../lib/auth';

// CORS preflight
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

// helper to get sellerId from JWT
async function getSellerId(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');
  return verifyToken(auth.slice(7)).userId;
}

export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
  try {
    const sellerId = await getSellerId(req);
    const { orderId } = params;
    const { status } = await req.json();
    if (!['pending','processing','completed','cancelled'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // Ensure this order belongs to one of this seller’s nurseries:
    const check = await pool.query(
      `SELECT 1
         FROM order_nursery onur
         JOIN nurseries n ON onur.nurseryid = n.nurseryid
         WHERE onur.orderid = $1 AND n.sellerid = $2`,
      [orderId, sellerId]
    );
    if (check.rowCount === 0) {
      return NextResponse.json({ message: 'Not found or forbidden' }, { status: 404 });
    }

    // Update the order_status in orders table
    await pool.query(
      `UPDATE orders
          SET order_status = $1
        WHERE orderid = $2`,
      [status, orderId]
    );

    const res = NextResponse.json({ orderId, status }, { status: 200 });
    res.headers.set('Access-Control-Allow-Origin','*');
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('PATCH order status error', err);
    const status = err.message === 'Unauthorized' ? 401 : 500;
    const res = NextResponse.json({ message: err.message }, { status });
    res.headers.set('Access-Control-Allow-Origin','*');
    return res;
  }
}
