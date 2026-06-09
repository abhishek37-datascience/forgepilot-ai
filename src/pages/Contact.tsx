import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Github, Linkedin } from 'lucide-react';
import { api } from '../utils/api';

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
                    <Github className="w-4.5 h-4.5 text-indigo-400" />
                    <span>GitHub Profile</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all text-xs font-semibold"
                  >
                    <Linkedin className="w-4.5 h-4.5 text-indigo-400" />
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
  );
}
