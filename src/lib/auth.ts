import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT utilities
// Ensure consistent secret across the application
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

const getJWTSecret = () => {
  return JWT_SECRET;
};

export function generateToken(userId: string): string {
  const secret = getJWTSecret();
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    console.log('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Password reset utilities
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function isResetTokenValid(tokenExpiry: Date): boolean {
  return new Date() < tokenExpiry;
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function isValidPassword(password: string): boolean {
  return password.length >= 6; // Minimum 6 characters
}

// Session utilities
export interface UserSession {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export function createSessionData(user: {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}): UserSession {
  return {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role
  };
} 