#!/usr/bin/env node
import path from 'path';
import dotenv from 'dotenv';
import logger from './utils/logger';
import './server';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Check required envs
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length) {
  logger.error(`Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

// Top-level error handlers
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

// Finally, start the server

