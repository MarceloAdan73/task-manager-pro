import express from 'express'
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  healthCheck
} from '../controllers/task.controller'
import { authenticateToken } from '../middleware/auth.middleware' 

const router = express.Router()

// Health check - public (no authentication required)
router.get('/health', healthCheck)

// ‚úÖ APPLY MIDDLEWARE TO ALL TASK ROUTES
router.use(authenticateToken) // All routes after this line require authentication

// Task routes - NOW PROTECTED Ì¥ê
router.get('/', getTasks)
router.get('/:id', getTaskById)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
