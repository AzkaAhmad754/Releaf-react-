import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { hashPassword, signToken } from '../../../../lib/auth';
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
  // parse JSON
  const {
    nurseryName,
    phoneNumber,
    idCard,
    email,
    password,
    confirmPassword,
    location,
    description
  } = await req.json();

  // validate required
  if (!nurseryName || !phoneNumber || !idCard || !password || !confirmPassword) {
    return NextResponse.json(
      { message: 'nurseryName, phoneNumber, idCard, password & confirmPassword are required' },
      { status: 400 }
    );
  }

  // validate password match
  if (password !== confirmPassword) {
    return NextResponse.json(
      { message: 'Passwords do not match' },
      { status: 400 }
    );
  }

  // hash the password
  let hashed: string;
  try {
    hashed = await hashPassword(password);
  } catch (err) {
    console.error('Hash error', err);
    return NextResponse.json({ message: 'Could not hash password' }, { status: 500 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO sellers
         (name, email, phone, cnic, address, password, description)
       VALUES
         ($1,$2,$3,$4,$5,$6,$7)
       RETURNING sellerid, name, email, phone, cnic, address, description`,
      [
        nurseryName,
        email || null,
        phoneNumber,
        idCard,
        location || null,
        hashed,
        description || null
      ]
    );

    const seller = result.rows[0];
    const token = signToken(seller.sellerid);

    const res = NextResponse.json({ seller, token }, { status: 201 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return res;
  } catch (err) {
    console.error('Seller registration error', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
