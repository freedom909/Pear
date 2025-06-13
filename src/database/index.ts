import mongoose from 'mongoose';
import { config } from '../config/app.config';
import { LoggerConfig } from '../config/logger.config';

/**
 * Connect to MongoDB database
 */
export async function connectDatabase(): Promise<void> {
  try {
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Connect to database
    await mongoose.connect(config.database.uri, config.database.options);
    
    // Log successful connection
    LoggerConfig.info('Successfully connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      LoggerConfig.error('MongoDB connection error', { error });
    });

    mongoose.connection.on('disconnected', () => {
      LoggerConfig.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      LoggerConfig.info('MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        LoggerConfig.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        LoggerConfig.error('Error closing MongoDB connection', { error });
        process.exit(1);
      }
    });

  } catch (error) {
    LoggerConfig.error('Error connecting to MongoDB', { error });
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    LoggerConfig.info('MongoDB connection closed');
  } catch (error) {
    LoggerConfig.error('Error closing MongoDB connection', { error });
    throw error;
  }
}

/**
 * Clear database (for testing)
 */
export async function clearDatabase(): Promise<void> {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearDatabase() can only be called in test environment');
  }

  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    LoggerConfig.info('Database cleared');
  } catch (error) {
    LoggerConfig.error('Error clearing database', { error });
    throw error;
  }
}