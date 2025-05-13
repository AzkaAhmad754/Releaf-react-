// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { hashPassword, signToken } from '../../../lib/auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    // 1) validate
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ message: 'All fields required' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ message: 'Passwords do not match' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be ≥ 6 chars' }, { status: 400 });
    }

    // 2) ensure email unique
    const exists = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    
    if (exists?.rowCount && exists.rowCount > 0) {
        return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
      }
      

    // 3) hash & insert
    const hashed = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (name,email,phone,password)
       VALUES ($1,$2,$3,$4)
       RETURNING userid,name,email,phone`,
      [name, email, '', hashed]
    );
    const user = result.rows[0];

    // 4) sign JWT
    const token = signToken(user.userid);

    // 5) respond
    const res = NextResponse.json({ user, token }, { status: 201 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return res;
  } catch (err) {
    console.error('Register error', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
