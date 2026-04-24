'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { Task } from '@/lib/types';

interface TaskEvent {
  type: 'task:created' | 'task:updated' | 'task:deleted';
  taskId: string;
  userId: string;
  data?: Task;
  timestamp: string;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3005';

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket connected');
      if (user?.id) {
        socketRef.current?.emit('join:user', user.id);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    socketRef.current.on('task:created', (event: TaskEvent) => {
      if (event.userId !== user?.id) {
        toast.success(`Nueva tarea: "${event.data?.title}"`);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    });

    socketRef.current.on('task:updated', (event: TaskEvent) => {
      if (event.userId !== user?.id) {
        toast.success(`Tarea actualizada: "${event.data?.title}"`);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    });

    socketRef.current.on('task:deleted', (event: TaskEvent) => {
      if (event.userId !== user?.id) {
        toast('Una tarea fue eliminada');
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    });

  }, [user, queryClient]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
  };
}