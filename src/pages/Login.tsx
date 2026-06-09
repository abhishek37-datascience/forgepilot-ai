import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

interface LoginProps {
  theme: 'dark' | 'light';
  setCurrentPage: (page: string) => void;
  login: (name: string, email: string, token: string) => void;
}

export default function Login({ theme, setCurrentPage, login }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Basic Validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    // Call Backend API
    api.auth.login(email, password)
      .then((data) => {
        setIsLoading(false);
        login(data.user.name, data.user.email, data.token);
      })
      .catch((err: any) => {
        setIsLoading(false);
        setError(err.message || 'Database connection error.');
      });
  };

  const handleForgotPassword = () => {
    setError('');
    setSuccessMsg('');
    if (!email) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    setIsLoading(true);

    api.auth.forgotPassword(email)
      .then((data) => {
        setIsLoading(false);
        setSuccessMsg(`🔑 Password Reset! Check console or use temporary password: ${data.tempPassword}`);
      })
      .catch((err: any) => {
        setIsLoading(false);
        setError(err.message || 'Failed to request password reset.');
      });
  };

  const fillMockCredentials = () => {
    setEmail('kavalaabhishek37@gmail.com');
    setPassword('forgepassword123');
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background patterns */}
      <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-grid-pattern opacity-60' : 'bg-grid-pattern-light opacity-60'}`} />
      
      <div className={`w-full max-w-md rounded-2xl border transition-all relative z-10 p-8 ${
        theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-2xl' : 'glass-light border-slate-200/80 shadow-xl'
      }`}>
        {/* Glow accent */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold font-heading">Welcome Back</h2>
          <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
            Sign in to resume building your projects
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-start space-x-2">
            <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                    : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                    : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 ${
              isLoading ? 'opacity-70 pointer-events-none' : ''
            }`}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo login shortcut */}
        <div className="mt-5 pt-4 border-t border-slate-850/40 text-center">
          <button
            type="button"
            onClick={fillMockCredentials}
            className="text-xs font-semibold text-indigo-400/90 hover:text-indigo-300 transition-colors bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10"
          >
            🔑 Fill Demo Credentials
          </button>
        </div>

        {/* Signup redirection link */}
        <p className={`text-xs text-center mt-6 font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
          Don't have an account?{' '}
          <button
            onClick={() => setCurrentPage('signup')}
            className="font-bold text-indigo-400 hover:text-indigo-300"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}
