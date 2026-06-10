import { Mail } from 'lucide-react';

interface FooterProps {
  theme: 'dark' | 'light';
  setCurrentPage: (page: string) => void;
}

export default function Footer({ theme, setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`mt-auto transition-colors duration-300 border-t ${
      theme === 'dark' 
        ? 'bg-slate-950/90 border-slate-900 text-slate-400' 
        : 'bg-slate-50 border-slate-200 text-slate-500'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" strokeDasharray="8 4" className="text-indigo-500" opacity="0.6"/>
                <path d="M52,18 L34,46 H47 L41,74 L62,40 H49 L52,18 Z" className="fill-indigo-500"/>
              </svg>
              <span className="text-lg font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                ForgePilot AI 🚀
              </span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed">
              Accelerating engineering career pathways by matching student profiles to high-fidelity, customized project blueprints backed by interactive step-by-step AI mentorship.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`text-sm font-semibold font-heading tracking-wider uppercase mb-4 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentPage('landing')} className="hover:text-indigo-400 transition-colors">
                  Home / Explore
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('about')} className="hover:text-indigo-400 transition-colors">
                  About Developer
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('contact')} className="hover:text-indigo-400 transition-colors">
                  Support Helpdesk
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('feedback')} className="hover:text-indigo-400 transition-colors">
                  Submit Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Support Info */}
          <div>
            <h3 className={`text-sm font-semibold font-heading tracking-wider uppercase mb-4 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Contact Support
            </h3>
            <p className="text-sm mb-3">
              Need assistance? Email our development desk:
            </p>
            <div className="space-y-2">
              <a 
                href="mailto:kavalaabhishek37@gmail.com" 
                className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                title="Primary Email"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>kavalaabhishek37@gmail.com</span>
              </a>
              <a 
                href="mailto:kavalasivaramasaiabhishek37@gmail.com" 
                className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                title="Secondary Email"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>kavalasivaramasaiabhishek37@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {currentYear} ForgePilot AI 🚀. All rights reserved. Created for engineering excellence.
          </p>
          <div className="flex space-x-4">
            <a href="https://github.com/abhishek37-datascience" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" aria-label="GitHub">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a href="mailto:kavalaabhishek37@gmail.com" className="hover:text-indigo-400 transition-colors" aria-label="Email Developer">
              <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
