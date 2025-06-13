import mongoose from 'mongoose';
import { config } from '../config/database.config';
import { LoggerConfig } from '../config/logger.config';

/**
 * Database connection options
 */
const options: mongoose.ConnectOptions = {
  autoIndex: true, // Build indexes
  minPoolSize: 10, // Maintain up to x socket connections
  maxPoolSize: 50, // Maintain up to x socket connections
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

/**
 * Connect to MongoDB
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.uri, options);

    LoggerConfig.info('MongoDB Connected', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name,
    });

    // Handle connection events
    mongoose.connection.on('connected', () => {
      LoggerConfig.info('MongoDB connection established');
    });

    mongoose.connection.on('disconnected', () => {
      LoggerConfig.warn('MongoDB connection disconnected');
    });

    mongoose.connection.on('error', (err) => {
      LoggerConfig.error('MongoDB connection error', { error: err });
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        LoggerConfig.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        LoggerConfig.error('Error closing MongoDB connection', { error: err });
        process.exit(1);
      }
    });

  } catch (error) {
    LoggerConfig.error('Error connecting to MongoDB', { error });
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    LoggerConfig.info('MongoDB connection closed');
  } catch (error) {
    LoggerConfig.error('Error closing MongoDB connection', { error });
    throw error;
  }
};

/**
 * Check database connection status
 */
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get database connection stats
 */
export const getDatabaseStats = async (): Promise<any> => {
  try {
    if (!isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const stats = await mongoose.connection.db.stats();
    return {
      status: 'connected',
      ...stats,
      connectionOptions: mongoose.connection.config,
    };
  } catch (error) {
    LoggerConfig.error('Error getting database stats', { error });
    throw error;
  }
};

/**
 * Clear database (for testing purposes only)
 */
export const clearDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('This operation is only allowed in test environment');
  }

  try {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    LoggerConfig.info('Database cleared');
  } catch (error) {
    LoggerConfig.error('Error clearing database', { error });
    throw error;
  }
};