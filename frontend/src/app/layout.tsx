// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from './providers/query-provider';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task Manager Pro',
  description: 'Professional task management with JWT authentication',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider> {/* ✅ NUEVO */}
            <QueryProvider>
              {children}
            </QueryProvider>
          </AuthProvider> {/* ✅ NUEVO */}
        </ThemeProvider>
      </body>
    </html>
  );
}