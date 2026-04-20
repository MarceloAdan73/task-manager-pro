import express from 'express'
import { exportToCSV, exportToPDF } from '../controllers/export.controller'
import { authenticateToken } from '../middleware/auth.middleware' 

const router = express.Router()

router.use(authenticateToken)

router.get('/csv', exportToCSV)
router.get('/pdf', exportToPDF)

export default router