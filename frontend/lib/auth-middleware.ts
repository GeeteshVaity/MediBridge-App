import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export interface AuthRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: 'patient' | 'shop';
  };
}

export function withAuth(
  handler: (request: AuthRequest) => Promise<NextResponse>,
  allowedRoles?: ('patient' | 'shop')[]
) {
  return async (request: AuthRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization header missing or invalid' },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Check role if specified
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return NextResponse.json(
          { error: 'Access denied. Insufficient permissions.' },
          { status: 403 }
        );
      }

      // Attach user to request
      request.user = decoded;

      return handler(request);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

// Helper to get user from token without middleware wrapper
export function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}
