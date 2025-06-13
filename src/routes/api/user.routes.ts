import express from 'express';
import { UserController } from '../../controllers/api/user.controller';
import { apiAuth, isAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * User API Routes
 * All routes are prefixed with /api/v1/users
 */

// Protected routes - require authentication
router.use(apiAuth);

// Current user routes
router.get('/me', UserController.getCurrentUser);
router.put('/me', UserController.updateCurrentUser);

// Admin only routes
router.get('/', isAdmin, UserController.listUsers);
router.get('/:id', isAdmin, UserController.getUserById);

export default router;