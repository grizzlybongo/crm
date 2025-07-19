import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { sendError } from '../utils/response';
import { getDatabase } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      sendError(res, 'Access token required', 401);
      return;
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, email, role, name, isActive FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user || !user.isActive) {
      sendError(res, 'User not found or inactive', 401);
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};