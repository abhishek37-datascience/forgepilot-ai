import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

interface SignupProps {
  theme: 'dark' | 'light';
  setCurrentPage: (page: string) => void;
  login: (name: string, email: string, token: string) => void;
}

export default function Signup({ theme, setCurrentPage, login }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    // Call Backend API
    api.auth.signup(name, email, password)
      .then((data) => {
        setIsLoading(false);
        login(data.user.name, data.user.email, data.token);
      })
      .catch((err: any) => {
        setIsLoading(false);
        setError(err.message || 'Registration failed.');
      });
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
          <h2 className="text-2xl font-bold font-heading">Forge Your Account</h2>
          <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
            Enter your details to create an engineering dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abhishek Kavala"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                    : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${
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
                placeholder="abhishek@gmail.com"
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
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Create Password
            </label>
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

          {/* Confirm Password field */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                    : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                }`}
              />
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
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login redirect link */}
        <p className={`text-xs text-center mt-6 font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-550'}`}>
          Already have an account?{' '}
          <button
            onClick={() => setCurrentPage('login')}
            className="font-bold text-indigo-400 hover:text-indigo-300"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
