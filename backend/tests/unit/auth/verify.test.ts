import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

jest.mock('cors', () => {
  return jest.fn().mockImplementation(() => {
    return (req: any, res: any, next: any) => next();
  });
});

let app: any;

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
          next();
        };
      },
      loginSchema
    };
  });

  app = require('../../../src/server').default;
});

import { prisma } from '../../../src/database/prisma';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('jsonwebtoken');

describe('Auth Controller - GET /api/auth/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar 401 si no hay token', async () => {
    const response = await request(app)
      .get('/api/auth/verify');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication token required');
  });

  it('debe retornar 403 si el token es inválido', async () => {
    const error = new Error('jwt malformed');
    error.name = 'JsonWebTokenError'; // ✅ IMPORTANTE: PONER EL name CORRECTO
    
    (jwt.verify as jest.Mock).mockImplementation((token, secret, cb) => {
      cb(error, null);
    });

    const response = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer token-invalido');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Invalid token'); // ✅ AHORA SÍ "Invalid token"
    expect(response.body.code).toBe('INVALID_TOKEN');
  });

  it('debe retornar 200 y el usuario si el token es válido', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (jwt.verify as jest.Mock).mockImplementation((token, secret, cb) => {
      cb(null, { userId: '1', email: 'test@test.com' });
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer token-valido');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@test.com');
    expect(response.body.data.name).toBe('Test User');
  });

  it('debe retornar 404 si el usuario no existe', async () => {
    (jwt.verify as jest.Mock).mockImplementation((token, secret, cb) => {
      cb(null, { userId: '1', email: 'test@test.com' });
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer token-valido');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });
});

describe('Auth Validation - GET /api/auth/verify', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.unmock('../../../src/validators/auth.validator');
  });

  it('debe requerir token (sin mock)', async () => {
    const appReal = require('../../../src/server').default;
    
    const response = await request(appReal)
      .get('/api/auth/verify');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication token required');
  });
});
