import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import flash from 'express-flash';
// Check if the file path is correct. Maybe the file is missing or the path is misspelled.
// If the file exists but the issue persists, ensure the 'config' export is defined correctly.
import { config } from './config/app.config.js';
import { LoggerConfig } from './config/logger.config.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import { apiRoutes } from './routes/index.js';
import { connectDatabase } from './database/index.js';
import { MailUtil } from './utils/mail.util.js';
import { configurePassport } from './config/google.passport.js';

/**
 * Main application class
 */
class App {
  public app: express.Application;

  /**
   * Constructor
   */
  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  /**
   * Configure middleware
   */
  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());

    // Request parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Performance middleware
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('dev'));
    }

    // Session configuration
    this.app.use(
      session({
        secret: config.sessionSecret || 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
      })
    );

    // Flash messages
    this.app.use(flash());

    // Passport initialization
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  /**
   * Configure API routes
   */
  private configureRoutes(): void {
    this.app.use('/api', apiRoutes);
  }

  /**
   * Configure error handling
   */
  private configureErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Start the application
   */
  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      LoggerConfig.info('Connected to database');

      // Initialize mail service
      await MailUtil.initialize();
      LoggerConfig.info('Mail service initialized');

      // Configure Passport
      configurePassport(this.app);
      LoggerConfig.info('Passport configured');

      // Start server
      const port = config.port;
      this.app.listen(port, () => {
        LoggerConfig.info(`Server running on port ${port}`);
      });
    } catch (error) {
      LoggerConfig.error('Failed to start server', { error });
      throw error;
    }
  }
}
export default new App();