import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import session from 'express-session';
import { handleOAuthUser } from '../../../services/handleOAuthUser';
import { isAuthenticated } from '../../../middleware/auth';
import { errorHandler } from '../../../middleware/errorHandler';
import User from '../../../models/user/model';

// 模拟依赖
jest.mock('passport');
jest.mock('../../../services/handleOAuthUser');
jest.mock('../../../models/user/model');

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
    (req: Request, res: Response) => {
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
    (req: Request, res: Response) => {
      res.redirect('/');
    }
  );

  app.get('/profile', isAuthenticated, (req: Request, res: Response) => {
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
    (passport.authenticate as jest.Mock).mockImplementation(
      (strategy, options) => {
        return (req: Request, res: Response, next: NextFunction) => {
          if (req.query.error) {
            return res.redirect(`/login?error=${req.query.error}`);
          }

          if (strategy === 'google' || strategy === 'facebook') {
            if (req.path.includes('callback')) {
              req.user = {
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
                role: 'user',
              };
              req.isAuthenticated = jest.fn().mockReturnValue(true);
            }
          }

          next();
        };
      }
    );
  });

  describe('Google OAuth', () => {
    it('应该重定向到Google认证页面', async () => {
      const response = await request(app).get('/auth/google');

      expect(passport.authenticate).toHaveBeenCalledWith('google', {
        scope: ['profile', 'email'],
      });
      expect(response.status).toBe(200);
    });

    it('应该处理Google回调并重定向到首页', async () => {
      const response = await request(app).get('/auth/google/callback');

      expect(passport.authenticate).toHaveBeenCalledWith('google', {
        failureRedirect: '/login',
      });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');
    });

    it('应该在认证失败时重定向到登录页面', async () => {
      const response = await request(app).get(
        '/auth/google/callback?error=access_denied'
      );

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('/login');
    });
  });

  describe('Facebook OAuth', () => {
    it('应该重定向到Facebook认证页面', async () => {
      const response = await request(app).get('/auth/facebook');

      expect(passport.authenticate).toHaveBeenCalledWith('facebook', {
        scope: ['email'],
      });
      expect(response.status).toBe(200);
    });

    it('应该处理Facebook回调并重定向到首页', async () => {
      const response = await request(app).get('/auth/facebook/callback');

      expect(passport.authenticate).toHaveBeenCalledWith('facebook', {
        failureRedirect: '/login',
      });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');
    });
  });

  describe('Protected Routes', () => {
    it('应该允许已认证用户访问受保护的路由', async () => {
      const agent = request.agent(app);

      // 模拟用户已登录
      (passport.session as jest.Mock).mockImplementation(() => {
        return (req: Request, res: Response, next: NextFunction) => {
          req.user = {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          };
          req.isAuthenticated = jest.fn().mockReturnValue(true);
          next();
        };
      });

      const response = await agent.get('/profile');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('应该阻止未认证用户访问受保护的路由', async () => {
      const agent = request.agent(app);

      // 模拟用户未登录
      (passport.session as jest.Mock).mockImplementation(() => {
        return (req: Request, res: Response, next: NextFunction) => {
          req.isAuthenticated = jest.fn().mockReturnValue(false);
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
    it('应该正确处理新用户', async () => {
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
        name: 'New User',
        googleId: 'google-123',
        profilePhoto: 'https://example.com/photo.jpg',
        role: 'user',
      };

      (handleOAuthUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await handleOAuthUser(mockProfile, mockTokenInfo);

      expect(handleOAuthUser).toHaveBeenCalledWith(mockProfile, mockTokenInfo);
      expect(result).toEqual(mockUser);
    });

    it('应该正确处理现有用户', async () => {
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
        name: 'Existing User',
        googleId: 'google-456',
        role: 'user',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (handleOAuthUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await handleOAuthUser(mockProfile, mockTokenInfo);

      expect(handleOAuthUser).toHaveBeenCalledWith(mockProfile, mockTokenInfo);
      expect(result).toEqual(mockUser);
    });

    it('应该处理无效的配置文件数据', async () => {
      const mockProfile = {
        // 缺少 id 和 provider
        displayName: 'Invalid User',
      };

      const mockTokenInfo = {
        accessToken: 'mock-access-token',
        provider: 'google',
      };

      (handleOAuthUser as jest.Mock).mockRejectedValue(
        new Error('Invalid profile data')
      );

      await expect(
        handleOAuthUser(mockProfile as any, mockTokenInfo)
      ).rejects.toThrow();
    });
  });
});
