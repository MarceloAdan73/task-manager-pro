import rateLimit from 'express-rate-limit';
import { envConfig } from '../config/env';

// Helper function to safely get client IP
const getClientIp = (req: any): string => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.connection?.socket?.remoteAddress || 
         'unknown';
};

// General API rate limiting
export const apiRateLimiter = rateLimit({
  windowMs: envConfig.RATE_LIMIT_WINDOW_MS, // 15 minutes default
  max: envConfig.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use helper function to safely get IP
    return getClientIp(req);
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
});

// Stricter rate limiting for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 login attempts per IP every 15 minutes
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => getClientIp(req),
});
