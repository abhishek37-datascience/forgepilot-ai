import React, { useState } from 'react';
import { Mail, MessageSquareCode, Award, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

interface FeedbackProps {
  theme: 'dark' | 'light';
}

export default function Feedback({ theme }: FeedbackProps) {
  const [feedbackType, setFeedbackType] = useState('feature'); // bug, feature, category, contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !details) {
      setError('Please fill in all input fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email.');
      return;
    }

    setLoading(true);

    api.activity.submitFeedback(name, email, feedbackType, details)
      .then(() => {
        setLoading(false);
        setSubmitted(true);
      })
      .catch((err: any) => {
        setLoading(false);
        setError(err.message || 'Failed to submit feedback to server.');
      });
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-grid-pattern opacity-55' : 'bg-grid-pattern-light opacity-55'}`} />

      <div className={`w-full max-w-xl rounded-2xl border transition-all relative z-10 p-8 ${
        theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-2xl' : 'glass-light border-slate-200/80 shadow-xl'
      }`}>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {submitted ? (
          <div className="text-center py-10 animate-float">
            <div className="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold font-heading">Feedback Lodged!</h2>
            <p className={`text-sm mt-3 max-w-sm mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Your ticket has been sent to kavalaabhishek37@gmail.com. We appreciate you taking the time to help make ForgePilot AI 🚀 even better.
            </p>
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setDetails('');
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 text-white shadow-md flex items-center space-x-2"
              >
                <span>Submit More Feedback</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
                <MessageSquareCode className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold font-heading">Feedback & Suggestions</h2>
              <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Help us polish the forge. Bug logs, feature designs, or branch requests welcome!
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selector */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Feedback Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'feature', label: 'Suggest Features', icon: Award },
                    { id: 'bug', label: 'Report Bug', icon: ShieldAlert },
                    { id: 'category', label: 'Request Category', icon: MessageSquareCode },
                    { id: 'admin', label: 'Contact Admin', icon: Mail }
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = feedbackType === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFeedbackType(cat.id)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center space-x-2 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-sm'
                            : theme === 'dark'
                            ? 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700'
                            : 'border-slate-200 bg-white text-slate-655 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Name
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kavalaabhishek37@gmail.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Message Details */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Provide Details
                </label>
                <textarea
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' 
                      ? 'Describe where the issue occurs, steps to reproduce, and actual vs expected results...' 
                      : feedbackType === 'category'
                      ? 'List the specific engineering branch, specialization, or programming language you want added...'
                      : 'Provide your comments here...'
                  }
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none resize-none ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                      : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Submit Ticket</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
