import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'admin-id') return { id: 'admin-id' };
    if (token === 'editor-id') return { id: 'editor-id' };
    if (token === 'user-id') return { id: 'user-id' };
    throw new Error('Invalid token');
  })
}));

// Set test environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  JWT_SECRET: 'test-secret'
};
import {
  authMiddleware as isAuthenticated,
  adminMiddleware,
  optionalAuthMiddleware as optionalAuth,
} from '../../../middleware/auth.middleware';
import { describe, expect, it, beforeEach } from '@jest/globals';


// 定义测试中使用的中间件函数
const hasRole = (roles: string[]): ((req: Request, res: Response, next: NextFunction) => Response | void) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user|| !(req as any).isAuthenticated()) {
      return res.status(401).json({ 
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Unauthorized' 
      });
    }
    
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ 
        status: 'error',
        code: 'FORBIDDEN',
        message: 'Forbidden' 
      });
    }
    
    next();
  };
};

const isResourceOwner = (getResourceOwnerId: (req: Request) => Promise<string | undefined>): ((req: Request, res: Response, next: NextFunction) => Promise<Response | void>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    if (!req.user || !(req as any).isAuthenticated()) {
      return res.status(401).json({ 
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Unauthorized' 
      });
    }
    
    try {
      const resourceOwnerId = await getResourceOwnerId(req);
      const user = (req as any).user;
      
      if (!resourceOwnerId) {
        return res.status(404).json({ 
          status: 'error',
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found' 
        });
      }
      
      if (user.id !== resourceOwnerId && user.role !== 'admin') {
        return res.status(403).json({ 
          status: 'error',
          code: 'FORBIDDEN',
          message: 'Forbidden' 
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// 模拟用户数据
const mockUsers = {
  admin: {
    id: 'admin-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  },
  editor: {
    id: 'editor-id',
    email: 'editor@example.com',
    name: 'Editor User',
    role: 'editor',
  },
  user: {
    id: 'user-id',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
  },
};

// 模拟资源数据
const mockResources = {
  'resource-1': { id: 'resource-1', name: 'Resource 1', ownerId: 'user-id' },
  'resource-2': { id: 'resource-2', name: 'Resource 2', ownerId: 'editor-id' },
};

// 创建测试应用
const createTestApp = () => {
  const app = express();

  // 配置中间件
  app.use(express.json());

  // 模拟用户认证
    app.use((req: Request & { user?: any }, _res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      const userIdHeader = req.headers['x-user-id'];
      
      // 优先使用 x-user-id 头模拟用户
      if (userIdHeader) {
        req.user = mockUsers[userIdHeader as keyof typeof mockUsers];
        (req as any).isAuthenticated = () => true;
        return next();
      }
      
      // 否则使用 Authorization 头
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return next();
      }
      
      const userId = Object.keys(mockUsers).find(key => 
        mockUsers[key as keyof typeof mockUsers].id === token
      );
      
      if (userId) {
        req.user = mockUsers[userId as keyof typeof mockUsers];
        (req as any).isAuthenticated = () => true;
      }
      
      next();
    });

    // Add error handler to prevent multiple responses
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        return next(err);
      }
      res.status(500).json({ 
        status: 'error',
        message: 'Internal server error'
      });
    });

  // 测试路由

  // 1. 认证检查
  app.get(
    '/api/auth/protected',
    isAuthenticated,
    (req: Request, res: Response) => {
      res.json({ message: '认证成功', user: req.user });
    }
  );

  // 2. 角色检查
  app.get('/api/auth/admin-only', adminMiddleware, (req: Request, res: Response) => {
    res.json({ message: '管理员访问成功', user: req.user });
  });

  app.get(
    '/api/auth/editor-or-admin',
    hasRole(['editor', 'admin']),
    (req: Request, res: Response) => {
      res.json({ message: '编辑者或管理员访问成功', user: req.user });
    }
  );

  // 3. 资源所有者检查
  app.get(
    '/api/resources/:resourceId',
    isResourceOwner(async (req: Request) => {
      const resourceId = req.params.resourceId;
      const resource = mockResources[resourceId as keyof typeof mockResources];
      return resource ? resource.ownerId : undefined;
    }),
    (req: Request, res: Response) => {
      const resourceId = req.params.resourceId;
      const resource = mockResources[resourceId as keyof typeof mockResources];
      res.json({ message: '资源访问成功', resource });
    }
  );

  // 4. 可选认证
  app.get('/api/public', optionalAuth, (req: Request, res: Response) => { 
    if ((req as any).isAuthenticated()) { 
      res.json({ message: '已认证用户访问', user: req.user }); 
    } else { 
      res.json({ message: '匿名用户访问' }); 
    } 
  });

  return app;
}

// Add test cases here to run the tests

// Example test for protected route
describe('Auth Middleware Tests', () => { 
  let app: express.Application; 

  beforeEach(() => { 
    app = createTestApp(); 
  }); 

  it('should allow authenticated users to access protected route', async () => { 
    const response = await request(app) 
      .get('/api/auth/protected') 
      .set('Authorization', 'Bearer admin-id'); 
    expect(response.status).toBe(200); 
  }); 

  it('should deny access to unauthenticated users', async () => { 
    const response = await request(app).get('/api/auth/protected'); 
    expect(response.status).toBe(401); 
  }); 
});

// 添加错误处理中间件

describe('Auth Middleware Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('isAuthenticated', () => {
    it('应该允许已认证用户访问受保护的路由', async () => {
      const response = await request(app)
        .get('/api/auth/protected')
        .set('Authorization', 'Bearer user-id');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '认证成功',
        user: expect.objectContaining({ id: 'user-id' }),
      });
    });

    it('应该阻止未认证用户访问受保护的路由', async () => {
      const response = await request(app).get('/api/auth/protected');

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'error',
          code: 'UNAUTHORIZED',
        })
      );
    });
  });

  describe('isAdmin', () => {
    it('应该允许管理员访问管理员路由', async () => {
      const response = await request(app)
        .get('/api/auth/admin-only')
        .set('Authorization', 'Bearer admin-id');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '管理员访问成功',
        user: expect.objectContaining({ role: 'admin' }),
      });
    });

    it('应该阻止非管理员用户访问管理员路由', async () => {
      const response = await request(app)
        .get('/api/auth/admin-only')
        .set('x-user-id', 'user');

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'error',
          code: 'FORBIDDEN',
        })
      );
    });

    it('应该阻止未认证用户访问管理员路由', async () => {
      const response = await request(app).get('/api/auth/admin-only');

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'error',
          code: 'UNAUTHORIZED',
        })
      );
    });
  });

  describe('hasRole', () => {
    it('应该允许管理员访问编辑者或管理员路由', async () => {
      const response = await request(app)
        .get('/api/auth/editor-or-admin')
        .set('Authorization', 'Bearer admin-id')
        .set('x-user-id', 'admin');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '编辑者或管理员访问成功',
        user: expect.objectContaining({ role: 'admin' }),
      });
    });

    it('应该允许编辑者访问编辑者或管理员路由', async () => {
      const response = await request(app)
        .get('/api/auth/editor-or-admin')
        .set('x-user-id', 'editor');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '编辑者或管理员访问成功',
        user: expect.objectContaining({ role: 'editor' }),
      });
    });

    it('应该阻止普通用户访问编辑者或管理员路由', async () => {
      const response = await request(app)
        .get('/api/auth/editor-or-admin')
        .set('x-user-id', 'user');

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'error',
          code: 'FORBIDDEN',
        })
      );
    });
  });

  describe('isResourceOwner', () => {
    it('应该允许资源所有者访问自己的资源', async () => {
      const response = await request(app)
        .get('/api/resources/resource-1')
        .set('x-user-id', 'user');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '资源访问成功',
        resource: expect.objectContaining({
          id: 'resource-1',
          ownerId: 'user-id',
        }),
      });
    });

    it('应该允许管理员访问任何资源', async () => {
      const response = await request(app)
        .get('/api/resources/resource-1')
        .set('x-user-id', 'admin');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '资源访问成功',
        resource: expect.objectContaining({ id: 'resource-1' }),
      });
    });

    it('应该阻止非所有者访问资源', async () => {
      const response = await request(app)
        .get('/api/resources/resource-2')
        .set('x-user-id', 'user');

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'error',
          code: 'FORBIDDEN',
        })
      );
    });

    it('应该在资源不存在时返回404错误', async () => {
      const response = await request(app)
        .get('/api/resources/non-existent')
        .set('x-user-id', 'user');

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'error',
          code: 'RESOURCE_NOT_FOUND',
        })
      );
    });
  });

  describe('optionalAuth', () => {
    it('应该允许已认证用户访问公共路由并返回用户信息', async () => {
      const response = await request(app)
        .get('/api/public')
        .set('x-user-id', 'user');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '已认证用户访问',
        user: expect.objectContaining({ id: 'user-id' }),
      });
    });

    it('应该允许未认证用户访问公共路由', async () => {
      const response = await request(app).get('/api/public');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '匿名用户访问',
      });
    });
  });
});