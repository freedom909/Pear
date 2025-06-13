import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/app.config';
import { connectDatabase } from './database';
import { configurePassport } from './config/passport.config';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { LoggerConfig } from './config/logger.config';
import { ErrorResponse } from './config/error.config';

export class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  /**
   * Configure application middleware
   */
  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Request parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    
    // Compression
    this.app.use(compression());
    
    // Logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('dev'));
    }
    
    // Configure passport
    configurePassport(this.app);
  }

  /**
   * Configure application routes
   */
  private configureRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });
    
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found'
        }
      });
    });
  }

  /**
   * Configure error handling
   */
  private configureErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      LoggerConfig.error('Application error', { error: err });
      
      const errorResponse = new ErrorResponse(err);
      
      res.status(errorResponse.statusCode).json({
        success: false,
        error: {
          code: errorResponse.code,
          message: errorResponse.message
        }
      });
    });
  }

  /**
   * Start the application
   */
  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      LoggerConfig.info('Connected to database');
      
      // Start server
      const port = config.port;
      this.app.listen(port, () => {
        LoggerConfig.info(`Server is running on port ${port}`);
      });
    } catch (error) {
      LoggerConfig.error('Failed to start application', { error });
      process.exit(1);
    }
  }

  /**
   * Get Express application instance
   */
  public getApp(): Express {
    return this.app;
  }
}

// Create and export app instance
export const app = new App();

// Start application if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.start().catch((error) => {
    LoggerConfig.error('Application startup error', { error });
    process.exit(1);
  });
}