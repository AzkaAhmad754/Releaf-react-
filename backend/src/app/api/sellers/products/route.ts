// src/app/api/sellers/products/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { verifyToken } from '../../../../lib/auth';
// Handle preflight CORS requests
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
  console.log("AUTH HEADER:", auth); // <- log token
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');

  try {
    const decoded = verifyToken(auth.slice(7));
    console.log("DECODED TOKEN:", decoded);
    return decoded.userId;
  } catch (err) {
    console.error("Token verification failed:", err);
    throw new Error('Unauthorized');
  }
}

export async function POST(req: Request) {
  try {
    const sellerId = await getSellerId(req);
    const body = await req.json();
    const { name, description, price, image, stock, trending, category } = body;

    // validate required
    if (!name || !description || price == null || !image || stock == null || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1) find nurseryid belonging to this seller
    const nr = await pool.query(
      `SELECT nurseryid FROM nurseries WHERE sellerid = $1 LIMIT 1`,
      [sellerId]
    );
    if (nr.rowCount === 0) {
      return NextResponse.json({ error: 'Nursery not found for seller' }, { status: 404 });
    }
    const nurseryId = nr.rows[0].nurseryid;

    // 2) find categoryid by name (case‐insensitive)
    const cr = await pool.query(
      `SELECT categoryid FROM categories WHERE LOWER(name) = LOWER($1)`,
      [category]
    );
    if (cr.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    const categoryId = cr.rows[0].categoryid;

    // 3) insert into items, leave survival_hrs default or hardcode e.g. 48
    const ir = await pool.query(
      `INSERT INTO items
         (name, description, price, survival_hrs, picture, trending, stock, nurseryid, categoryid)
       VALUES ($1,$2,$3,48,$4,$5,$6,$7,$8)
       RETURNING *`,
      [name, description, price, image, trending, stock, nurseryId, categoryId]
    );

    const newItem = ir.rows[0];
    const res = NextResponse.json({ item: newItem }, { status: 201 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Add product error:', err);
    const status = err.message === 'Unauthorized' ? 401 : 500;
    const res = NextResponse.json({ error: err.message }, { status });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
  }
}

export async function GET(req: Request) {
  try {
    const sellerId = await getSellerId(req);
    console.log("Fetching products for seller:", sellerId);
    // Items → nurseries → sellers
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
        WHERE s.sellerid = $1`,
      [sellerId]
    ); 
    
    const res = NextResponse.json(rows, { status: 200 });
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

