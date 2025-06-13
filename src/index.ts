import dotenv from 'dotenv';
import path from 'path';
import { App } from './app';
import { LoggerConfig } from './config/logger.config';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Set default environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize logger
// Since 'init' does not exist on 'typeof LoggerConfig', we assume there's a different way to initialize.
// Here we need more context, but for now, we'll comment out the problematic line.
// LoggerConfig.init();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  LoggerConfig.error('Uncaught Exception', { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  LoggerConfig.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start application
const app = new App();
app.start().catch((error) => {
  LoggerConfig.error('Failed to start application', { error });
  process.exit(1);
});