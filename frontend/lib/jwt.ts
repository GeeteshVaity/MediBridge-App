import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'patient' | 'shop';
}

export interface TokenUserLike {
  _id?: string | { toString(): string };
  id?: string;
  email: string;
  role: 'patient' | 'shop';
}

export function generateToken(user: TokenUserLike): string {
  const payload: JWTPayload = {
    userId: String(user._id ?? user.id ?? ''),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
