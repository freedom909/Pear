import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';

// Create router
const router = Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };