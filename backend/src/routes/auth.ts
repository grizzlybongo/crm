import { Router } from 'express';
import { 
  login, 
  register, 
  refreshToken, 
  logout, 
  getProfile, 
  updateProfile 
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { validateLogin, validateRegister } from '../utils/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);
router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;