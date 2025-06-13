import { Router } from 'express';
import { userRoutes } from './user.routes';

// Create router
const router = Router();

// Register routes
router.use('/users', userRoutes);

export { router as apiRoutes };