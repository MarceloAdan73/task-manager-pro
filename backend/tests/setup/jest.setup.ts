import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
