// src/app/api/sellers/profile/route.ts
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// extract & verify JWT, return sellerId
async function getSellerId(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');
  const { userId } = verifyToken(auth.slice(7));
  return userId;
}

export async function GET(req: Request) {
  try {
    const sellerId = await getSellerId(req);

    // join sellers → nurseries to fetch settings
    const { rows } = await pool.query(
      `SELECT
         s.sellerid,
         s.name           AS nurseryName,
         s.email,
         s.phone          AS phoneNumber,
         s.cnic           AS idCard,
         s.address,
         s.description,
         n.opening_hours  AS openingHours,
         n.closing_hours  AS closingHours,
         n.delivery_charges AS deliveryFee
       FROM sellers s
       LEFT JOIN nurseries n ON n.sellerid = s.sellerid
       WHERE s.sellerid = $1
      `,
      [sellerId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const profile = rows[0];
    const res = NextResponse.json(profile, { status: 200 });
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

export async function PUT(req: Request) {
  try {
    const sellerId = await getSellerId(req);
    const body = await req.json();
    const {
      nurseryName,
      phoneNumber,
      idCard,
      email,
      address,
      description,
      openingHours,
      closingHours,
      deliveryAvailable,
      deliveryFee
    } = body;

    // 1) update sellers table
    await pool.query(
      `UPDATE sellers
         SET name        = $1,
             phone       = $2,
             cnic        = $3,
             email       = $4,
             address     = $5,
             description = $6
       WHERE sellerid = $7
      `,
      [nurseryName, phoneNumber, idCard, email, address, description, sellerId]
    );

    // 2) update nurseries table (assumes one nursery per seller)
    await pool.query(
      `UPDATE nurseries
         SET opening_hours    = $1,
             closing_hours    = $2,
             delivery_charges = $3
       WHERE sellerid = $4
      `,
      [
        openingHours,
        closingHours,
        deliveryAvailable ? deliveryFee : 0,
        sellerId
      ]
    );

    const res = NextResponse.json({ message: 'Settings updated' }, { status: 200 });
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
