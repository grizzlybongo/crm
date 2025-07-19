import { Router } from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
} from '../controllers/clientController';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { validateClient, validatePagination, validateId } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get client statistics (admin only)
router.get('/stats', authorize('admin'), getClientStats);

// Get all clients with pagination and search
router.get('/', validatePagination, handleValidationErrors, getClients);

// Get specific client
router.get('/:id', validateId, handleValidationErrors, getClient);

// Create new client (admin only)
router.post('/', authorize('admin'), validateClient, handleValidationErrors, createClient);

// Update client
router.put('/:id', validateId, validateClient, handleValidationErrors, updateClient);

// Delete client (admin only)
router.delete('/:id', authorize('admin'), validateId, handleValidationErrors, deleteClient);

export default router;