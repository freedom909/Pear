const path = require('path');
const { authService } = require('./dist/src/services/auth.service');

async function createTestUser() {
  try {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test1234!'
    };
    
    console.log('Attempting to create test user...');
    const result = await authService.register(testUser);
    console.log('Test user created successfully:');
    console.log(result);
  } catch (error) {
    console.error('Error creating test user:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    if (error.response?.data) {
      console.error('\nResponse data:');
      console.error(error.response.data);
    }
  }
}

createTestUser();