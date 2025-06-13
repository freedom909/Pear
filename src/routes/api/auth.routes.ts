import express from 'express';
import { AuthController } from '../../controllers/api/auth.controller';

const router = express.Router();

/**
 * Auth API Routes
 * All routes are prefixed with /api/v1/auth
 */

// Public routes - no authentication required
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/refresh-token', AuthController.refreshToken);

export default router;