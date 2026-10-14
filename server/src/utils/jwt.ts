import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-mygate-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  approvalStatus?: string;
  flatId?: string | null;
  unitNumber?: string | null;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
