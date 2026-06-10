import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

const GithubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface ContactProps {
  theme: 'dark' | 'light';
}

export default function Contact({ theme }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !subject || !message) {
      setError('Please fill out all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    api.activity.submitFeedback(name, email, 'admin', `Subject: ${subject}\n\n${message}`)
      .then(() => {
        setLoading(false);
        setSubmitted(true);
      })
      .catch((err: any) => {
        setLoading(false);
        setError(err.message || 'Failed to submit contact query to server.');
      });
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-grid-pattern opacity-55' : 'bg-grid-pattern-light opacity-55'}`} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-4xl relative z-10">
        
        {/* Left Column: Form */}
        <div className={`md:col-span-7 rounded-2xl border transition-all p-8 relative ${
          theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-2xl' : 'glass-light border-slate-200/80 shadow-xl'
        }`}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {submitted ? (
            <div className="text-center py-10 animate-float">
              <div className="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold font-heading">Message Dispatched!</h2>
              <p className={`text-sm mt-3 max-w-sm mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Thank you for contacting ForgePilot AI 🚀 support. A confirmation response has been logged to your address. We'll follow up shortly.
              </p>
              <div className="mt-8 flex justify-center space-x-3">
                <a href="mailto:kavalaabhishek37@gmail.com" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 text-white shadow-md flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Developer Desk</span>
                </a>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setSubject('');
                    setMessage('');
                  }}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-semibold ${
                    theme === 'dark' ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Send New Message
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold font-heading">Contact & Support</h2>
                <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Have questions or need manual assistance? Drop us a line.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Abhishek"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                        theme === 'dark'
                          ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                          : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kavala@example.com"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                        theme === 'dark'
                          ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                          : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Need help with recommendation blueprint"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your details here..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none resize-none ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Right Column: Connect with Developer Card */}
        <div className={`md:col-span-5 rounded-2xl border transition-all p-8 flex flex-col justify-between ${
          theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-2xl' : 'glass-light border-slate-200/80 shadow-xl'
        }`}>
          <div className="space-y-6 text-left">
            <div>
              <span className="text-xxs font-extrabold uppercase text-indigo-400 tracking-wider">Project Author</span>
              <h3 className="text-xl font-bold font-heading mt-1 text-slate-200">Abhishek Kavala</h3>
              <p className="text-xs text-slate-400 mt-0.5">Full Stack & Data Science Engineer</p>
            </div>

            <div className="border-t border-slate-800/40 pt-4 space-y-4 text-xs">
              <div>
                <span className="block text-[10px] text-slate-550 font-bold uppercase tracking-wider mb-2">Developer Desk Contacts</span>
                <div className="space-y-2.5">
                  <div className="flex flex-col">
                    <span className="text-slate-550 font-semibold text-[10px]">Primary Email</span>
                    <a href="mailto:kavalaabhishek37@gmail.com" className="font-bold text-indigo-455 hover:underline text-indigo-400">
                      kavalaabhishek37@gmail.com
                    </a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-550 font-semibold text-[10px]">Secondary Email</span>
                    <a href="mailto:kavalasivaramasaiabhishek37@gmail.com" className="font-bold text-indigo-455 hover:underline text-indigo-400">
                      kavalasivaramasaiabhishek37@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/40 pt-4">
                <span className="block text-[10px] text-slate-550 font-bold uppercase tracking-wider mb-2">Connect With Developer</span>
                <div className="flex flex-col gap-2">
                  <a 
                    href="https://github.com/abhishek37-datascience" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all text-xs font-semibold"
                  >
                    <GithubIcon className="w-4.5 h-4.5 text-indigo-400" />
                    <span>GitHub Profile</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all text-xs font-semibold"
                  >
                    <LinkedinIcon className="w-4.5 h-4.5 text-indigo-400" />
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/40 text-left">
            <span className="text-[10px] text-slate-500 leading-relaxed block">
              Clicking GitHub and LinkedIn profiles will open developer portfolio pages in a new browser tab.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
