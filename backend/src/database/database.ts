// database.ts
import mongoose from "mongoose";
import config from "../config/config";
import logger from "../middleware/logger";

export class Database {
  static async connect(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      logger.info("Database already connected");
      return;
    }
    try {
      await mongoose.connect(config.mongo.uri);
      logger.info("Database connected");
    } catch (error: any) {
      logger.error("Database connection error", error);
      process.exit(1); // Optionally exit if you can't connect
    }
  }

  static async disconnect(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        logger.info("Database disconnected");
      }
    } catch (error: any) {
      logger.error("Error disconnecting database", error);
    }
  }
}
