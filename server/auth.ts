import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hd-reklam-admin-secret-key-2025';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = '$2a$10$YourHashedPasswordHere'; // We'll set this properly

export interface AuthRequest extends Request {
  user?: {
    username: string;
    isAdmin: boolean;
  };
}

export function generateToken(username: string): string {
  return jwt.sign(
    { username, isAdmin: true },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): { username: string; isAdmin: boolean } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

export async function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme gerekli' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded || !decoded.isAdmin) {
    return res.status(403).json({ message: 'Yetkisiz erişim' });
  }
  
  req.user = decoded;
  next();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}