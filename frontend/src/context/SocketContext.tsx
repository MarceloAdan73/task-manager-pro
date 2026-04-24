'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from './AuthContext';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useSocket();

  return <>{children}</>;
}