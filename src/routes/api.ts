import express from 'express';
import { Request, Response } from 'express';
import authRoutes from './api/auth.routes';
import userRoutes from './api/user.routes';
import { ApiResponse } from '../utils/api-response.util';

const router = express.Router();

/**
 * API Health Check
 * @route GET /api/health
 */
router.get('/health', (req: Request, res: Response) => {
  ApiResponse.success(res, {
    timestamp: new Date().toISOString()
  }, 'API is running');
});

/**
 * API Version 1 Routes
 * All v1 routes are prefixed with /v1
 */
const v1Router = express.Router();

// Health check for v1
v1Router.get('/health', (req: Request, res: Response) => {
  ApiResponse.success(res, {
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }, 'API v1 is running');
});

// Mount v1 routes
v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);

// Mount v1 router
router.use('/v1', v1Router);

/**
 * API Documentation
 * @route GET /api
 */
router.get('/', (req: Request, res: Response) => {
  ApiResponse.success(res, {
    versions: {
      v1: '/api/v1'
    },
    documentation: {
      health: '/api/health',
      v1: {
        health: '/api/v1/health',
        auth: {
          login: '/api/v1/auth/login',
          register: '/api/v1/auth/register',
          refreshToken: '/api/v1/auth/refresh-token'
        },
        users: {
          me: '/api/v1/users/me',
          list: '/api/v1/users',
          getById: '/api/v1/users/:id'
        }
      }
    }
  }, 'Welcome to the API');
});

export default router;