// Cargar dotenv antes que cualquier otra cosa
require('dotenv').config({ path: '.env.test' });

// Forzar variables de entorno para el test
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/taskmanager_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

console.log('✅ ENV CARGADO PARA TEST:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '✓' : '✗',
  JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗'
});
