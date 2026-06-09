import { useState } from 'react';
import { Sun, Moon, Menu, X, LogOut, User, Sparkles, LayoutDashboard, Mail, MessageSquare } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: { name: string; email: string } | null;
  logout: () => void;
  hasProfile: boolean;
}

export default function Navbar({
  theme,
  toggleTheme,
  currentPage,
  setCurrentPage,
  user,
  logout,
  hasProfile
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Sparkles, show: true },
    { id: 'about', label: 'About', icon: User, show: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: !!user },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles, show: !!user && hasProfile },
    { id: 'contact', label: 'Support', icon: Mail, show: true },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, show: true }
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setIsOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-950/70 border-slate-800/80' : 'bg-white/70 border-slate-200/80'
    } border-b backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavClick('landing')}>
            <svg className="w-8 h-8 mr-2.5 animate-pulse-slow" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" stroke="url(#logoGrad)" strokeWidth="4" strokeDasharray="8 4" opacity="0.6"/>
              <path d="M52,18 L34,46 H47 L41,74 L62,40 H49 L52,18 Z" fill="url(#logoGrad)"/>
            </svg>
            <span className="text-xl font-bold font-heading tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              ForgePilot AI 🚀<span className="text-xs ml-0.5 align-super text-indigo-400 font-semibold font-sans">AI</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-400 border border-indigo-500/20'
                      : `text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 border border-transparent`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all ${
                theme === 'dark' 
                  ? 'border-slate-800 bg-slate-900/50 text-indigo-400 hover:bg-slate-900' 
                  : 'border-slate-200 bg-slate-50 text-amber-500 hover:bg-slate-100'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm border font-medium transition-all ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/30 text-slate-300 hover:border-slate-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-500" />
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                    theme === 'dark' ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="px-4 py-2 text-sm font-semibold tracking-wide text-white rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all ${
                theme === 'dark' ? 'border-slate-800 text-indigo-400' : 'border-slate-200 text-amber-500'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg border transition-all ${
                theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className={`md:hidden px-4 pt-2 pb-4 border-t space-y-1 transition-all ${
          theme === 'dark' ? 'bg-slate-950/95 border-slate-900' : 'bg-white/95 border-slate-100'
        }`}>
          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-900/40 hover:text-indigo-400 border border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-800/40 flex flex-col space-y-2.5">
            {user ? (
              <>
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-50'
                }`}>
                  <User className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('login')}
                  className={`w-full py-2.5 text-center font-medium rounded-lg ${
                    theme === 'dark' ? 'text-slate-300 hover:bg-slate-900/40' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="w-full py-2.5 text-center font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
