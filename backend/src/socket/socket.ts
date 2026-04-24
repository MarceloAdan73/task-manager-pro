import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env';

let io: Server | null = null;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export interface TaskEvent {
  type: 'task:created' | 'task:updated' | 'task:deleted';
  taskId: string;
  userId: string;
  data?: any;
  timestamp: string;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = (socket.handshake.auth as Record<string, string>)?.token;

  if (!token) {
    console.warn(`🔒 Socket auth failed: No token provided (socket: ${socket.id})`);
    return next(new Error('Authentication token required'));
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      console.warn(`🔒 Socket auth failed: Invalid token (socket: ${socket.id})`);
      if (err.name === 'TokenExpiredError') {
        return next(new Error('Token expired'));
      }
      return next(new Error('Invalid token'));
    }

    (socket as AuthenticatedSocket).userId = decoded.userId;
    console.log(`🔑 Socket authenticated for user: ${decoded.userId}`);
    next();
  });
}

export function initializeSocket(httpServer: HttpServer): Server {
  if (io) return io;

  const isProduction = envConfig.NODE_ENV === 'production';

  io = new Server(httpServer, {
    cors: {
      origin: isProduction
        ? [envConfig.FRONTEND_URL]
        : [envConfig.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3004'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(authMiddleware);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 Client connected: ${socket.id} (user: ${socket.userId})`);

    socket.on('join:user', (requestedUserId: string) => {
      if (!socket.userId) {
        console.warn(`⚠️ Unauthorized join:user attempt from socket ${socket.id}`);
        return;
      }

      if (requestedUserId !== socket.userId) {
        console.warn(`⚠️ User ${socket.userId} tried to join room ${requestedUserId} (not their own)`);
        return;
      }

      if (requestedUserId && typeof requestedUserId === 'string') {
        console.log(`👤 User ${requestedUserId} joined room`);
        socket.join(`user:${requestedUserId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized with JWT authentication');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
}

export function emitTaskEvent(event: TaskEvent): void {
  if (!io) return;
  io.to(`user:${event.userId}`).emit(event.type, event);
  console.log(`📡 Emitted ${event.type} for user ${event.userId}`);
}