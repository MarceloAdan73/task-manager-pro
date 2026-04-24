import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { envConfig } from '../config/env';

let io: Server | null = null;

export interface TaskEvent {
  type: 'task:created' | 'task:updated' | 'task:deleted';
  taskId: string;
  userId: string;
  data?: any;
  timestamp: string;
}

export function initializeSocket(httpServer: HttpServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: envConfig.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join:user', (userId: string) => {
      console.log(`👤 User ${userId} joined room`);
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized');
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