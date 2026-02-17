import { Router } from 'express'
import { login, verify } from '../controllers/auth.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

// POST /api/auth/login - Login with Zod validation
router.post('/login', login)

// GET /api/auth/verify - Verify JWT token
router.get('/verify', authenticateToken, verify)

export default router
