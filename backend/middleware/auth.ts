import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

const JWT_EXPIRES_IN = '7d';

/**
 * Retrieves the JWT Secret strictly from process.env.JWT_SECRET.
 * Throws a fatal error if missing - never uses a fallback or default secret.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing. Server startup aborted.');
  }
  return secret;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Generate a signed JWT for an authenticated user
 */
export function generateToken(user: { id: string; email: string; role: UserRole; name: string }): string {
  const secret = getJwtSecret();
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT string
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as TokenPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: Verify Bearer JWT in Authorization header
 * Rejects missing, invalid, or expired tokens with HTTP 401
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Access token is missing or invalid' });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Access token is missing or invalid' });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = decoded;
    next();
  } catch {
  return res.status(401).json({ error: 'Unauthorized: Access token has expired or is invalid' });
  }
}

/**
 * Middleware: Role Authorization
 * Checks if authenticated user has one of the allowed roles
 * Rejects with HTTP 403 Forbidden if role doesn't match
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s). Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
}
