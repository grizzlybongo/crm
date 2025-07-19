import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, AuthTokens } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateTokens = (user: Partial<User>): AuthTokens => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'erp-pro',
    audience: 'erp-pro-users'
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'erp-pro',
      audience: 'erp-pro-users'
    }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'erp-pro',
      audience: 'erp-pro-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'erp-pro',
      audience: 'erp-pro-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};