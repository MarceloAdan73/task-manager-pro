import request from 'supertest';
import dotenv from 'dotenv';

// ✅ LOAD TEST ENVIRONMENT VARIABLES
dotenv.config({ path: '.env.test' });

// ✅ MOCK CORS
jest.mock('cors', () => {
  return jest.fn().mockImplementation(() => {
    return (req: any, res: any, next: any) => next();
  });
});

// Variable to store app
let app: any;

// ✅ USE doMock TO CONTROL EXECUTION ORDER
beforeAll(() => {
  jest.doMock('../../../src/validators/auth.validator', () => {
    const { z } = require('zod');
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });

    return {
      validate: (schema: any) => {
        return (req: any, res: any, next: any) => {
          // ALWAYS PASS - skip validation in controller tests
          next();
        };
      },
      loginSchema
    };
  });

  // Import app AFTER the mock
  app = require('../../../src/server').default;
});

import { prisma } from '../../../src/database/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Additional mocks
jest.mock('../../../src/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller - POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('should return 401 if password is incorrect', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      password: 'hashedpassword',
      name: 'Test User'
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('should return 200 and a JWT token if credentials are valid', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      password: 'hashedpassword',
      name: 'Test User'
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'correctpassword'
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('fake-jwt-token');
    expect(response.body.user.email).toBe('test@test.com');
    expect(response.body.user.name).toBe('Test User');
  });
});

// Validation tests - using REAL validator
describe('Auth Validation - POST /api/auth/login', () => {
  // ✅ RESET everything to get real validator
  beforeEach(() => {
    jest.resetModules();
    jest.unmock('../../../src/validators/auth.validator');
    delete process.env.NODE_ENV; // Temporarily remove test mode
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test'; // Restore test mode
  });

  it('should return 400 if email is invalid', async () => {
    process.env.NODE_ENV = 'development'; // Force validation
    
    const appReal = require('../../../src/server').default;

    const response = await request(appReal)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 if password is too short', async () => {
    process.env.NODE_ENV = 'development'; // Force validation
    
    const appReal = require('../../../src/server').default;

    const response = await request(appReal)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: '123'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
