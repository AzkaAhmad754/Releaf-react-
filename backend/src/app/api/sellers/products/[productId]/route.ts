import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';
import { verifyToken } from '../../../../../lib/auth';

// CORS helper function to standardize response headers
function jsonWithCors(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    }
  });
}

// OPTIONS request for CORS preflight
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

// Helper function to get the sellerId from the authorization token
async function getSellerId(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Unauthorized');
  return verifyToken(auth.slice(7)).userId;
}

// GET a single product (for the edit form)
export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    const sellerId = await getSellerId(req);
    const { productId } = params;
    // ensure it belongs to this seller
    const result = await pool.query(
      `SELECT i.* 
         FROM items i
         JOIN nurseries n ON i.nurseryid = n.nurseryid
         WHERE i.itemid=$1 AND n.sellerid=$2`,
      [productId, sellerId]
    );
    if (result.rowCount === 0) return jsonWithCors({ message: 'Not found' }, 404);
    const p = result.rows[0];
    return jsonWithCors(p, 200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return jsonWithCors({ message: err.message }, err.message === 'Unauthorized' ? 401 : 500);
  }
}

// PATCH to update a product
export async function PATCH(req: Request, { params }: { params: { productId: string } }) {
  try {
    const sellerId = await getSellerId(req);
    const { productId } = params;
    const body = await req.json();
    // only allow certain fields
    const fields = ['name', 'description', 'price', 'stock', 'categoryid', 'trending', 'picture'];
    const sets = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals: any[] = [];
    let idx = 1;
    for (const k of fields) {
      if (body[k] !== undefined) {
        sets.push(`${k}=$${idx++}`);
        vals.push(body[k]);
      }
    }
    if (!sets.length) return jsonWithCors({ message: 'No fields' }, 400);
    // ensure seller owns product
    vals.push(productId, sellerId);
    const sql = `
      UPDATE items i 
      SET ${sets.join(', ')}
      FROM nurseries n 
      WHERE i.nurseryid=n.nurseryid 
        AND i.itemid=$${idx++} 
        AND n.sellerid=$${idx}
    `;
    await pool.query(sql, vals);
    return jsonWithCors({ message: 'Updated' }, 200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return jsonWithCors({ message: err.message }, err.message === 'Unauthorized' ? 401 : 500);
  }
}

// DELETE a product
export async function DELETE(req: Request, { params }: { params: { productId: string } }) {
  try {
    const sellerId = await getSellerId(req);
    const { productId } = params;
    // only delete if seller owns it
    await pool.query(
      `DELETE FROM items i USING nurseries n
         WHERE i.nurseryid=n.nurseryid
           AND i.itemid=$1 
           AND n.sellerid=$2`,
      [productId, sellerId]
    );
    return jsonWithCors({ message: 'Deleted' }, 200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return jsonWithCors({ message: err.message }, err.message === 'Unauthorized' ? 401 : 500);
  }
}
