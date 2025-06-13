import mongoose from 'mongoose';
import { config } from './app.config';
import { LoggerConfig } from './logger.config';

/**
 * Database configuration class
 * Handles MongoDB connection and configuration
 */
export class DatabaseConfig {
  /**
   * Connect to MongoDB
   */
  public static async connect(): Promise<void> {
    try {
      // Set mongoose configuration options
      mongoose.set('strictQuery', true);
      
      // Connect to MongoDB
      await mongoose.connect(config.mongoConfig.uri, config.mongoConfig.options);
      
      LoggerConfig.info('Successfully connected to MongoDB.');

      // Handle MongoDB connection events
      mongoose.connection.on('error', (error) => {
        LoggerConfig.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        LoggerConfig.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        LoggerConfig.info('MongoDB reconnected successfully.');
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      LoggerConfig.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public static async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      LoggerConfig.info('MongoDB connection closed.');
    } catch (error) {
      LoggerConfig.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Check if MongoDB is connected
   * @returns true if connected to MongoDB
   */
  public static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get mongoose connection
   * @returns Mongoose connection
   */
  public static getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  /**
   * Clear all collections (useful for testing)
   * Warning: This will delete all data in the database
   */
  public static async clearDatabase(): Promise<void> {
    if (config.env !== 'test') {
      throw new Error('clearDatabase can only be called in test environment');
    }

    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      LoggerConfig.info('Successfully cleared all collections.');
    } catch (error) {
      LoggerConfig.error('Error clearing database:', error);
      throw error;
    }
  }

  /**
   * Create indexes for all models
   * This ensures that all indexes defined in the models are created
   */
  public static async createIndexes(): Promise<void> {
    try {
      const models = mongoose.modelNames();
      for (const modelName of models) {
        const model = mongoose.model(modelName);
        await model.createIndexes();
      }
      LoggerConfig.info('Successfully created indexes for all models.');
    } catch (error) {
      LoggerConfig.error('Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   * @returns Database statistics
   */
  public static async getStats(): Promise<any> {
    try {
      const stats = await mongoose.connection.db.stats();
      return stats;
    } catch (error) {
      LoggerConfig.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Check database health
   * @returns true if database is healthy
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      LoggerConfig.error('Database health check failed:', error);
      return false;
    }
  }
}