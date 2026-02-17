import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../../src/middleware/auth.middleware';

jest.mock('jsonwebtoken');

describe('Auth Middleware - authenticateToken', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('debe retornar 401 si no hay token', () => {
    authenticateToken(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Authentication token required'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el formato del token es inválido', () => {
    mockReq.headers = {
      authorization: 'InvalidFormat'
    };

    authenticateToken(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Authentication token required'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe retornar 403 si el token es inválido', () => {
    mockReq.headers = {
      authorization: 'Bearer token-invalido'
    };

    const error = new Error('jwt malformed');
    error.name = 'JsonWebTokenError'; // ✅ name CORRECTO
    
    (jwt.verify as jest.Mock).mockImplementation((token, secret, cb) => {
      cb(error, null);
    });

    authenticateToken(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(jwt.verify).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token', // ✅ AHORA SÍ "Invalid token"
      code: 'INVALID_TOKEN'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token expiró', () => {
    mockReq.headers = {
      authorization: 'Bearer token-expirado'
    };

    const tokenExpiredError = new Error('Token expired');
    tokenExpiredError.name = 'TokenExpiredError';
    
    (jwt.verify as jest.Mock).mockImplementation((token, secret, cb) => {
      cb(tokenExpiredError, null);
    });

    authenticateToken(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(jwt.verify).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe llamar a next() y agregar userId si el token es válido', () => {
    mockReq.headers = {
      authorization: 'Bearer token-valido'
    };

    (jwt.verify as jest.Mock).mockImplementation((token, secret, cb) => {
      cb(null, { userId: '123', email: 'test@test.com' });
    });

    authenticateToken(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(jwt.verify).toHaveBeenCalled();
    expect(mockReq.userId).toBe('123');
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
