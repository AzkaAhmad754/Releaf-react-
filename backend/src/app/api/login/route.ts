// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { verifyPassword, signToken } from '../../../lib/auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: Request) {

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow all origins, or specify your domain
      'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed methods
      'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
    }
  });
}

export async function POST(req: Request) {
  console.log("Handling POST request");
  try {
    const { email, password } = await req.json();
    console.log('Received email:', email); // Check if email is parsed correctly
    console.log('Received password:', password); // Check if password is parsed correctly

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      );
    }

    try {
      // Query the database for the user by email
      const result = await pool.query(
        `SELECT userid, name, email, phone, password FROM users WHERE email = $1`,
        [email]
      );

      if (result.rowCount === 0) {
        console.error('Invalid credentials - User not found');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const user = result.rows[0];
      
      // Verify the password using your verifyPassword function
      const ok = await verifyPassword(password, user.password);
      if (!ok) {
        console.error('Invalid credentials - Password mismatch');
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      // Issue JWT token
      const token = signToken(user.userid);

      // Don't send password back in the response
      delete user.password;
      
      // Add CORS headers to the response
      const response = NextResponse.json({ user, token }, { status: 200 });
      response.headers.set('Access-Control-Allow-Origin', '*');  // Allow all origins
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');  // Allow specific methods
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');  // Allow specific headers

      return response;

    } catch (err) {
      console.error('Login error:', err);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log(error);
  }
}
