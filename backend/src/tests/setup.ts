import mongoose from 'mongoose';
import { config } from 'dotenv';
// Test setup file - no logger import needed

// Increase test timeout to 30 seconds
jest.setTimeout(30000);

// Load environment variables
config({ path: '.env.test' });

// Mock logger to prevent test logs from cluttering output
jest.mock('../middleware/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Global test hooks
beforeAll(async () => {
  // Set default test database URI if not provided
  const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/pear_test';
  
  // Connect to test database with retry logic
  const maxRetries = 5;
  let retryCount = 0;
  
  const connectWithRetry = async () => {
    try {
      await mongoose.connect(TEST_DB_URI, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        retryWrites: true,
        retryReads: true
      });
      console.log('✅ Connected to test database');
    } catch (err) {
      retryCount++;
      if (retryCount >= maxRetries) {
        console.error('❌ Failed to connect to test database after multiple retries');
        throw err;
      }
      console.warn(`⚠️ Failed to connect to test database (attempt ${retryCount}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await connectWithRetry();
    }
  };
  
  await connectWithRetry();
}, 30000); // 30s timeout for db connection

afterAll(async () => {
  try {
    // Clean up database and close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  } catch (err) {
    console.error('Error during test cleanup:', err);
  }
});

afterEach(async () => {
  // Clear all mocks after each test
  jest.clearAllMocks();
  
  // Clear database collections with error handling
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      try {
        await collections[key].deleteMany({});
      } catch (err) {
        console.error(`Error cleaning collection ${key}:`, err);
      }
    }
  } catch (err) {
    console.error('Error during test cleanup:', err);
  }
});