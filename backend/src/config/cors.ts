import { CorsOptions } from 'cors';
import { envConfig } from './env';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {

    if (envConfig.NODE_ENV === 'development') {
      const allowedOrigins = [
        envConfig.FRONTEND_URL,
        'http://localhost:3004',
        'http://127.0.0.1:3004',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    } else {

      const allowedOrigins = [
        envConfig.FRONTEND_URL,
        'http://localhost:3004',
        'http://127.0.0.1:3004',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, 
};