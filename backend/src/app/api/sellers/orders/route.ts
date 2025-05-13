// src/app/api/sellers/orders/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { verifyToken } from '../../../../lib/auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
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

    const { rows } = await pool.query(
      `SELECT 
         o.orderid::text                AS id,
         od.itemid                      AS itemId,
         i.name                         AS name,
         i.picture                      AS image,
         od.quantity                    AS quantity,
         od.price_at_order              AS priceAtOrder,
         o.total_amount                 AS totalPrice,
         o.order_status                 AS status,
         o.order_date                   AS date
       FROM order_nursery onur
       JOIN nurseries n    ON onur.nurseryid      = n.nurseryid
       JOIN sellers s      ON n.sellerid         = s.sellerid
       JOIN orders o       ON onur.orderid        = o.orderid
       JOIN order_details od ON onur.ordernurseryid = od.ordernurseryid
       JOIN items i        ON od.itemid           = i.itemid
       WHERE s.sellerid = $1
       ORDER BY o.order_date DESC`,
      [sellerId]
    );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ordersMap: Record<string, any> = {};
for (const r of rows) {
  if (!ordersMap[r.id]) {
    ordersMap[r.id] = {
      id: r.id,
      items: [],
      customer: {
        name: '',    // you can join users table if you want customer info
        email: ''
      },
      totalPrice: Number(r.totalprice),
      status: r.status,
      date: r.date
    };
  }
  ordersMap[r.id].items.push({
    id:       r.itemId,
    name:     r.name,
    price:    Number(r.priceatorder),
    quantity: r.quantity,
    image:    r.image,
    sellerId: String(sellerId)
  });
}

    const res = NextResponse.json(Object.values(ordersMap), { status: 200 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const res = NextResponse.json(
      { message: err.message },
      { status: err.message === 'Unauthorized' ? 401 : 500 }
    );
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
  }
}
