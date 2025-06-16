import { Router } from 'express';
import { userRoutes } from './user.routes.js';
import { authRoutes } from './auth.routes.js';

// Create router
const router = Router();

// Register routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

export { router as apiRoutes };