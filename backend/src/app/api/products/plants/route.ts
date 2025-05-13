// src/app/api/plants/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Adjust if your db file is in a different path

// Handle preflight CORS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  try {
    // Fetch all products in "plants" category
    const { rows } = await pool.query(
      `SELECT i.itemid      AS id,
              i.name        AS name,
              i.description AS description,
              i.price       AS price,
              c.name        AS category,
              i.picture     AS image,
              i.stock       AS stock,
              i.trending    AS trending,
              s.name        AS nursery,
              s.address     AS location,
              s.sellerid    AS sellerId
         FROM items i
         JOIN categories c ON i.categoryid = c.categoryid
         JOIN nurseries n ON i.nurseryid = n.nurseryid
         JOIN sellers s   ON n.sellerid = s.sellerid
        WHERE LOWER(c.name) = 'plants'`
    );

    const res = NextResponse.json(rows, { status: 200 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Error fetching plants:', err);
    const res = NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
  }
}
