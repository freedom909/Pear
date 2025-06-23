import mongoose from 'mongoose';
import  config  from '../config/config';
import logger from '../utils/logger';


export class database {
    static async connect() {
        try {
// Assume the correct property is 'mongo' instead of 'database' based on the error
            await mongoose.connect(config.mongo.uri);
            logger.info('Database connected');
            // Handle process termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });
        } catch (error : any) {
            logger.error(error);
        }
    }
    static async disconnect() : Promise<void>{
        try {
            await mongoose.connection.close();
            logger.info('Database disconnected');
        } catch (error : any) {
            logger.error(error);
        }
    }

    static async init(): Promise<void> {
        try {
            await this.connect();
        } catch (error : any) {
            logger.error('Error initializing database', error);
        }
    }

    static async close() : Promise<void>{
        try {
            await this.disconnect();
            logger.info('Database connection closed');
        } catch (error : any) {
            logger.error('Error closing database connection', error);
        }
    }

    static async initAndClose() : Promise<void>{
        try {
            await this.init();
            await this.close();
        } catch (error : any) {
            logger.error('Error initializing and closing database connection', error);
        }
    }

    static async initAndCloseWithErrorHandling() : Promise<void>{
        try {
            await this.init();
            await this.close();
        } catch (error : any) {
            logger.error('Error initializing and closing database connection', error);
        }
    }

    static async initAndCloseWithErrorHandlingAndReconnection() : Promise<void>{
        try {
            await this.init();
            await this.close();
        } catch (error : any) {
            logger.error('Error initializing and closing database connection', error);
            await this.connect();
        }
    }
    static async initAndCloseWithErrorHandlingAndReconnectionAndlogger() : Promise<void>{
        try {
            await this.init();
            await this.close();
        } catch (error : any) {
            logger.error('Error initializing and closing database connection', error);
            await this.connect();
            logger.info('Database reconnected');
        }
    }

    static async initAndCloseWithErrorHandlingAndReconnectionAndLogOnError() : Promise<void>{
        try {
            await this.init();
            await this.close();
        } catch (error : any) {
            logger.error('Error initializing and closing database connection', error);
            await this.connect();
            logger.info('Database reconnected');
        }
    }
    static async initAndCloseWithErrorHandlingAndReconnectionAndLogOnErrorAndLogOnClose() : Promise<void>{
        try {
            await this.init();
            await this.close();
        } catch (error : any) {
            logger.error('Error initializing and closing database connection', error);
            await this.connect();
            logger.info('Database reconnected');
        }
    }

    static async initAndCloseWithErrorHandlingAndReconnectionAndLogOnErrorAndLogOnCloseAndLogOnInit() : Promise<void>{
        try {
            await this.init();
            await this.close();
        } catch (error : any) {
            logger.error('Error initializing and closing database connection', error);
            await this.connect();
            logger.info('Database reconnected');
        }
    }

    static async createIndexes() : Promise<void>{
        try{
            const models=mongoose.modelNames();
            for (const modelName of models) {
                const model = mongoose.model(modelName);
                await model.createIndexes();
              }
            }
         catch (error : any) {
            logger.error('Error creating indexes', error);
        }
    }

    static async createIndexesForAllModels() : Promise<void>{
        try{
            const models=mongoose.modelNames();
            for (const modelName of models) {
                const model = mongoose.model(modelName);
                await model.createIndexes();
              }
            }
         catch (error : any) {
            logger.error('Error creating indexes', error);
        }
    }
    static async createIndexesForModel(modelName: string) : Promise<void>{
        try{
            const model = mongoose.model(modelName);
            await model.createIndexes();
        } catch (error : any) {
            logger.error('Error creating indexes', error);
        }
    }   

}