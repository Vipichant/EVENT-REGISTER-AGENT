import React, { useState } from 'react';
import { ShieldCheck, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  setCurrentTab: (tab: 'home' | 'register' | 'admin-login' | 'admin-dashboard') => void;
}

export default function AdminLogin({ onLoginSuccess, setCurrentTab }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Success
      onLoginSuccess(data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[75vh] flex flex-col justify-center py-6 px-3 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Back Link */}
        <button
          onClick={() => setCurrentTab('home')}
          className="mx-auto flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-700 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Homepage</span>
        </button>

        {/* Brand Shield Header */}
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-slate-950 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="mt-2.5 text-lg font-extrabold tracking-tight text-slate-900">Admin Control Panel</h2>
          <p className="mt-0.5 text-[10px] text-slate-500">Sign in to manage student entries, verify payments, and download rosters.</p>
        </div>

      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-5 px-5 shadow-sm border border-slate-200 rounded sm:px-6">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded p-2 flex gap-1.5 items-start animate-shake">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] font-semibold text-red-600 leading-tight">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Admin Username
              </label>
              <div className="relative rounded shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded outline-none focus:border-blue-600 focus:ring-0 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <div className="relative rounded shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded outline-none focus:border-blue-600 focus:ring-0 transition-all"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[9px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Quick Credentials:</span>
              Use <strong>admin</strong> and <strong>admin123</strong> to enter.
            </div>

            {/* Submit */}
            <div>
              <button
                id="admin-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-3 border border-transparent rounded text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 focus:outline-none transition-all cursor-pointer disabled:opacity-55"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
