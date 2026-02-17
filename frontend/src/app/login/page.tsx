'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LogIn, 
  Lock, 
  Mail, 
  AlertCircle, 
  Zap, 
  ArrowRight, 
  ShieldCheck,
  Globe,
  Cpu,
  Layers,
  Database,
  Code2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, ingresa tus credenciales.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Acceso denegado.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@taskmanager.com');
    setPassword('demo123');
    setError(''); 
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200 dark:bg-zinc-900 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200 dark:bg-zinc-900 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-6 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl transition-transform hover:scale-105">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Tasker Pro
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm italic">
            Secure Enterprise Task Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          
          {/* Recruiter/Demo Box */}
          <div className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-[0.15em] mb-2">
                  System Preview Mode
                </p>
                <div className="space-y-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-3 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <p>USR: demo@taskmanager.com</p>
                  <p>PWD: demo123</p>
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1 hover:underline transition-all group"
                >
                  Apply demo credentials <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-xs font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Identity
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all placeholder:text-zinc-400 text-sm text-zinc-900 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Access Key
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all placeholder:text-zinc-400 text-sm text-zinc-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Tech Footer */}
        <footer className="mt-10 text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-2 max-w-[320px] mx-auto">
            <TechBadge label="Next.js" icon={Zap} />
            <TechBadge label="React" icon={Cpu} />
            <TechBadge label="Tailwind" icon={Layers} />
            <TechBadge label="Prisma" icon={Database} />
            <TechBadge label="Postgres" icon={Code2} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-4 text-zinc-300 dark:text-zinc-800">
              <div className="w-12 h-[1px] bg-current" />
              <Globe className="w-3 h-3 opacity-50" />
              <div className="w-12 h-[1px] bg-current" />
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] font-bold">
              Designed by <span className="text-zinc-900 dark:text-white">Marcelo Adán</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* --- Subcomponent con soporte para iconos --- */
function TechBadge({ label, icon: Icon }: { label: string; icon?: any }) {
  return (
    <span className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider shadow-sm flex items-center gap-1.5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
      {Icon && <Icon className="w-3 h-3 text-zinc-400" />}
      {label}
    </span>
  );
}