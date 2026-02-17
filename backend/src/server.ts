import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/task.routes';
import authRoutes from './routes/auth.routes';

// ========== IMPORT ENHANCED SECURITY CONFIGURATIONS ==========
import { corsOptions } from './config/cors';
import { helmetMiddleware } from './middleware/helmet';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit';
import { envConfig } from './config/env';

console.log('🚀 ========================================');
console.log('🚀 SERVER.TS INICIANDO - VERSIÓN CON SEGURIDAD MEJORADA');
console.log('🚀 ========================================');

dotenv.config();

const app: Application = express();
const PORT = envConfig.PORT;

// ========== ENHANCED SECURITY MIDDLEWARE ==========
app.use(helmetMiddleware); // ✅ NEW: Security headers
app.use(cors(corsOptions)); // ✅ UPDATED: Specific CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== RATE LIMITING ==========
// Apply general rate limiting to all API routes
app.use('/api', apiRateLimiter); // ✅ NEW: Attack protection

// Basic logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ========== ENHANCED HEALTH CHECK ==========
app.get('/api/health', async (req: Request, res: Response) => {
  console.log('🏥 Health check - Versión mejorada');
  try {
    res.json({
      success: true,
      status: 'healthy',
      message: 'Task Manager API with enhanced security',
      timestamp: new Date().toISOString(),
      environment: envConfig.NODE_ENV,
      version: '3.0.0',
      security: {
        cors: 'specific-origin',
        rateLimiting: 'enabled',
        helmet: 'enabled',
        validation: 'zod-enabled'
      },
      database: 'PostgreSQL'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// ========== ROUTES WITH SPECIFIC SECURITY ==========
// Auth routes with stricter rate limiting
app.use('/api/auth', authRateLimiter, authRoutes); // ✅ ENHANCED

// Task routes (protected by JWT middleware)
app.use('/api/tasks', taskRoutes);

// ========== ENHANCED ROOT ROUTE ==========
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Task Manager API with Enhanced Security',
    version: '3.0.0',
    database: 'PostgreSQL',
    security: {
      cors: 'origin-specific',
      rateLimiting: 'enabled',
      headers: 'helmet-protected',
      validation: 'zod-schemas'
    },
    endpoints: {
      auth: '/api/auth/login',
      tasks: '/api/tasks',
      health: '/api/health',
      test: '/api/test-postgresql'
    },
    frontend: envConfig.FRONTEND_URL,
    backend: `http://localhost:${PORT}`,
    environment: envConfig.NODE_ENV
  });
});

// ========== DIRECT DATABASE TEST ROUTE (KEPT) ==========
app.get('/api/test-postgresql', async (req: Request, res: Response) => {
  console.log('🔧 TEST DIRECTO - PostgreSQL con seguridad');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const taskCount = await prisma.task.count();
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'PostgreSQL connection successful',
      counts: {
        tasks: taskCount,
        users: userCount
      },
      database: 'PostgreSQL',
      isConnected: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      database: 'PostgreSQL',
      isConnected: false,
      suggestion: 'Verify PostgreSQL is running on port 5432'
    });
  }
});

// ========== ENHANCED GLOBAL ERROR HANDLING ==========
// 404 - Route not found
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Global error handler:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(envConfig.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// ========== START SERVER WITH ENHANCED INFO ==========
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log('🚀 BACKEND CON SEGURIDAD MEJORADA');
    console.log('🚀 Puerto:', PORT);
    console.log('🚀 Ambiente:', envConfig.NODE_ENV);
    console.log('🚀 Frontend URL:', envConfig.FRONTEND_URL);
    console.log('🚀 ========================================');
    console.log('✅ API: http://localhost:' + PORT);
    console.log('✅ Health: http://localhost:' + PORT + '/api/health');
    console.log('✅ Security Features:');
    console.log('   • CORS: Origin-specific');
    console.log('   • Rate Limiting: Enabled');
    console.log('   • Security Headers: Helmet.js');
    console.log('   • Validation: Zod schemas');
    console.log('========================================');
  });
}

export default app;