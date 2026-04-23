// Cargar dotenv antes que cualquier otra cosa
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });

// Forzar variables de entorno para el test
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/taskmanager_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-32chars';
process.env.JWT_EXPIRES_IN = '1d';
process.env.PORT = '3005';
process.env.FRONTEND_URL = 'http://localhost:3004';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

console.log('✅ ENV CARGADO PARA TEST:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '✓' : '✗',
  JWT_SECRET: process.env.JWT_SECRET ? '✓' : '✗',
  FRONTEND_URL: process.env.FRONTEND_URL ? '✓' : '✗'
});
