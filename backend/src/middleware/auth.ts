import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler';
import { AuthRequest } from '../types';
import User from '../models/User';

// Protect routes - verify JWT token
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1) Get token from headers
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here') as jwt.JwtPayload;

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Grant access to protected route
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    next(new AppError('Authentication failed. Please log in again.', 401));
  }
};

// Role-based authorization
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user exists on request
    if (!req.user) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }
    
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
}; 