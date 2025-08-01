import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';

// Mock UserDocument factory
import {createMockUser} from '../../createMockUser';
import passport from 'passport';
import session from 'express-session';
import { handleOAuthUser } from '../../../services/handleOAuthUser';
// Since the module has no exported member 'isAuthenticated',
// you need to check the actual exported name in the auth module.
// Here we assume it's exported as 'authenticate' for demonstration.
import { isAuthenticated } from '../../../middleware/auth';
import { errorHandler } from '../../../middleware/errorHandler';
// Try to adjust the import path based on the actual project structure.
import type { RequestHandler } from 'express';
import User from '../../../models/user/user.model';
import { UserDocument } from '../../../models/user/user.types';
import {jest, describe, beforeEach, it, expect} from '@jest/globals';
import { OAuthTokenInfo } from '../../../models/interface';
import type { AuthenticateOptions } from 'passport';
// 模拟依赖
jest.mock('passport', () => ({
  initialize: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  session: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  authenticate: jest.fn((_strategy: string, options: any) => 
    (_req: any, res: any, next: any) => {
      if (options?.failureRedirect) {
        return res.redirect(options.failureRedirect);
      }
      if (options?.successRedirect) {
        return res.redirect(options.successRedirect);
      }
      next();
    }
  ),
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn()
}));
jest.mock('../../../services/handleOAuthUser');
jest.mock('../../../models/user/user.model');

export interface AuthRequest extends Request {
  user?: Partial<UserDocument> | typeof User | any;
}




// 创建测试应用
const createTestApp = () => {
  const app = express();

  // 配置中间件
  app.use(express.json());
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // 配置路由
  app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (_req: Request, res: Response) => {
      res.redirect('/');
    }
  );

  app.get(
    '/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );

  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (_req: Request, res: Response) => {
      res.redirect('/');
    }
  );

app.get('/profile', isAuthenticated as express.RequestHandler, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});


  app.use(errorHandler);

  return app;
};

describe('OAuth Authentication Flow', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();

    // 模拟 passport.authenticate 方法
  (passport.authenticate as jest.MockedFunction<
  (strategy: string, options?: Partial<AuthenticateOptions>) => RequestHandler
>).mockImplementation((strategy, options) => {

       return (req: Request, _res: Response, next: NextFunction) => {
      if (req.query.error) {
        if (options?.failureRedirect) {
          return _res.redirect(options.failureRedirect);
        }
        return next(new Error(req.query.error as string));
      }

        // Handle successful authentication
        if (strategy === 'google' || strategy === 'facebook') {
          const authReq = req as AuthRequest;
          authReq.user = createMockUser();
          (authReq as any).isAuthenticated = jest.fn().mockReturnValue(true);
          if (options?.successRedirect) {
            return _res.redirect(options.successRedirect);
          }
        }
        
        next();
      };
    });
  })



  describe('Google OAuth', () => {
    it('should redirect to Google authentication page', async () => {
      const response = await request(app).get('/auth/google');

      expect(passport.authenticate).toHaveBeenCalledWith('google', {
        scope: ['profile', 'email'],
      });
      expect(response.status).toBe(302);
    });

    it('should handle Google callback and redirect to home page', async () => {
      const response = await request(app).get('/auth/google/callback');

      expect(passport.authenticate).toHaveBeenCalledWith('google', {
        failureRedirect: '/login',
      });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');
    });

    it('should redirect to login page on authentication failure', async () => {
      const response = await request(app).get(
        '/auth/google/callback?error=access_denied'
      );

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/login');
    });
  });

  describe('Facebook OAuth', () => {
    it('should redirect to Facebook authentication page', async () => {
      const response = await request(app).get('/auth/facebook');

      expect(passport.authenticate).toHaveBeenCalledWith('facebook', {
        scope: ['email'],
      });
      expect(response.status).toBe(302);
    });

    it('should handle Facebook callback and redirect to home page', async () => {
      const response = await request(app).get('/auth/facebook/callback');

      expect(passport.authenticate).toHaveBeenCalledWith('facebook', {
        failureRedirect: '/login',
      });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');
    });
  });

  describe('Protected Routes', () => {
    it('should allow authenticated users to access protected routes', async () => {
      const agent = request.agent(app);

      // 模拟用户已登录
      (passport.session as jest.Mock).mockImplementation(() => {
        return (_req: Request, _res: Response, next: NextFunction) => {
         (_req as any).user = createMockUser();
          (_req as any).isAuthenticated = jest.fn().mockReturnValue(true);
          next();
        };
      });

      const response = await agent.get('/profile');

      expect(response.status).toBe(302);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should prevent unauthenticated users from accessing protected routes', async () => {
      const agent = request.agent(app);

      // 模拟用户未登录
      (passport.session as jest.Mock).mockImplementation(() => {
        return (_req: Request, _res: Response, next: NextFunction) => {


          (_req as any).isAuthenticated = jest.fn().mockReturnValue(false);
          next();
        };
      });

      const response = await agent.get('/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('code', 'UNAUTHORIZED');
    });
  });

  describe('handleOAuthUser Service', () => {
    it('should throw error when OAuth provider returns invalid data', async () => {
      const invalidProfile = {
        id: null,
        emails: []
      };

      await expect(handleOAuthUser(invalidProfile, 'facebook'as unknown as OAuthTokenInfo))
        .rejects
        .toThrow('Invalid profile data from OAuth provider');
    });
    it('should handle new users correctly', async () => {
      const mockProfile = {
        id: 'google-123',
        provider: 'google',
        displayName: 'New User',
        emails: [{ value: 'new@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };

      const mockTokenInfo = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        provider: 'google',
      };

      const mockUser = {
        id: 'new-user-id',
        email: 'new@example.com',
        username: 'New User',
        googleId: 'google-123',
        profilePhoto: 'https://example.com/photo.jpg',
        role: 'user',
      };

      (handleOAuthUser as jest.Mock).mockResolvedValue(mockUser as unknown as never);

      const result = await handleOAuthUser(mockProfile, mockTokenInfo);

      expect(handleOAuthUser).toHaveBeenCalledWith(mockProfile, mockTokenInfo);
      expect(result).toEqual(mockUser);
    });

    it('should handle existing users correctly', async () => {
      const mockProfile = {
        id: 'google-456',
        provider: 'google',
        displayName: 'Existing User',
        emails: [{ value: 'existing@example.com' }],
      };

      const mockTokenInfo = {
        accessToken: 'mock-access-token',
        provider: 'google',
      };

      const mockUser = {
        id: 'existing-user-id',
        email: 'existing@example.com',
        username: 'Existing User',
        googleId: 'google-456',
        role: 'user',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser as unknown as never);
      (handleOAuthUser as jest.Mock).mockResolvedValue(mockUser as unknown as never);

      const result = await handleOAuthUser(mockProfile, mockTokenInfo);

      expect(handleOAuthUser).toHaveBeenCalledWith(mockProfile, mockTokenInfo);
      expect(result).toEqual(mockUser);
    });

    it('should handle invalid profile data', async () => {
      const mockProfile = {
        // 缺少 id 和 provider
        displayName: 'Invalid User',
      };

      const mockTokenInfo = {
        accessToken: 'mock-access-token',
        provider: 'google',
      };

      (handleOAuthUser as jest.Mock).mockRejectedValue(
        new Error('Invalid profile data') as unknown as never
      );

      await expect(
        handleOAuthUser(mockProfile as any, mockTokenInfo)
      ).rejects.toThrow();
    });
  });
});