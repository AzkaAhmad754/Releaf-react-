// src/app/api/sellers/signin/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { verifyPassword, signToken } from '../../../../lib/auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    // look up seller
    const result = await pool.query(
      `SELECT sellerid, name, email, phone, cnic, address, password, description
         FROM sellers
        WHERE email = $1`,
      [email]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const seller = result.rows[0];
    const ok = await verifyPassword(password, seller.password);
    if (!ok) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    delete seller.password;
    const token = signToken(seller.sellerid);

    const res = NextResponse.json({ seller, token }, { status: 200 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;

  } catch (err) {
    console.error('Seller login error', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
