// src/lib/auth.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Cors from 'cors'
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';

const cors = Cors({
  origin:"*",
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function runCors(req: any , res: any): any {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
}
// hash a plaintext password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// verify a plaintext password against a hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  console.log("Hash" , hash);
  //return bcrypt.compare(password, hash);
  return password === hash;
}

// sign a JWT (we put userId in payload)
export function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// verify a JWT and return its payload
export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
}
