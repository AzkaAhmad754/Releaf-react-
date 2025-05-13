import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Adjust the import path if needed

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
    // Query to fetch trending items from your database
    const { rows } = await pool.query(
      `SELECT i.itemid      AS id,
              i.name        AS name,
              i.price       AS price,
              i.picture     AS image,
              i.trending    AS trending
         FROM items i
        WHERE i.trending = true`
    );

    // Respond with the fetched rows
    const res = NextResponse.json(rows, { status: 200 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Error fetching trending items:', err);
    
    // In case of an error, respond with a 500 status code
    const res = NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
  }
}
