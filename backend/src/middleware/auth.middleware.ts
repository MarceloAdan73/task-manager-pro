import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Use environment variables directly
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header
 * Verifies token validity
 * Attaches userId to request object
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // "Bearer TOKEN"

    // No token provided
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication token required'
      })
      return
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        // Handle different JWT error types
        if (err.name === 'TokenExpiredError') {
          res.status(401).json({
            success: false,
            error: 'Token expired',
            code: 'TOKEN_EXPIRED'
          })
        } else if (err.name === 'JsonWebTokenError') {
          res.status(403).json({
            success: false,
            error: 'Invalid token',
            code: 'INVALID_TOKEN'
          })
        } else {
          res.status(403).json({
            success: false,
            error: 'Token verification failed'
          })
        }
        return
      }

      // Attach userId to request for downstream use
      req.userId = decoded.userId

      // Continue to next middleware/route handler
      next()
    })

  } catch (error) {
    console.error('Error in authentication middleware:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
