import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { hashPassword, comparePassword, generateTokens } from '../utils/auth';
import { sendSuccess, sendError } from '../utils/response';
import { LoginRequest, RegisterRequest, User } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;
    const db = getDatabase();

    // Find user by email
    const user = await db.get(
      'SELECT * FROM users WHERE email = ? AND isActive = 1',
      [email]
    );

    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Update last login
    await db.run(
      'UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, 'Login successful', {
      user: userWithoutPassword,
      tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, company, phone }: RegisterRequest = req.body;
    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      sendError(res, 'User with this email already exists', 409);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = uuidv4();
    await db.run(
      `INSERT INTO users (id, email, password, name, role, company, phone, isActive, emailVerified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, name, 'client', company, phone, 1, 0]
    );

    // If registering as client, also create client record
    const clientId = uuidv4();
    await db.run(
      `INSERT INTO clients (id, userId, name, email, phone, company, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientId, userId, name, email, phone || '', company || '', '', 'active']
    );

    // Get created user
    const newUser = await db.get(
      'SELECT id, email, name, role, company, phone, isActive, emailVerified, createdAt FROM users WHERE id = ?',
      [userId]
    );

    // Generate tokens
    const tokens = generateTokens(newUser);

    sendSuccess(res, 'Registration successful', {
      user: newUser,
      tokens
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendError(res, 'Refresh token required', 400);
      return;
    }

    // Verify refresh token logic would go here
    // For now, return error as refresh token implementation needs more setup
    sendError(res, 'Refresh token functionality not implemented yet', 501);
  } catch (error) {
    console.error('Refresh token error:', error);
    sendError(res, 'Invalid refresh token', 401);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // In a real implementation, you would invalidate the token
    // For now, just send success response
    sendSuccess(res, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, email, name, role, company, phone, avatar, isActive, emailVerified, lastLogin, createdAt FROM users WHERE id = ?',
      [req.user?.id]
    );

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, 'Profile retrieved successfully', user);
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, company, phone, address } = req.body;
    const db = getDatabase();

    await db.run(
      'UPDATE users SET name = ?, company = ?, phone = ?, address = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, company, phone, address, req.user?.id]
    );

    // If user is a client, also update client record
    if (req.user?.role === 'client') {
      await db.run(
        'UPDATE clients SET name = ?, company = ?, phone = ?, address = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?',
        [name, company, phone, address, req.user.id]
      );
    }

    const updatedUser = await db.get(
      'SELECT id, email, name, role, company, phone, avatar, address, isActive, emailVerified, lastLogin, createdAt, updatedAt FROM users WHERE id = ?',
      [req.user?.id]
    );

    sendSuccess(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 'Internal server error', 500);
  }
};