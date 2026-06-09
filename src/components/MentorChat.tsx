import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Terminal, HelpCircle, X, ChevronDown } from 'lucide-react';
import type { AdaptedProject } from '../utils/projectAdapter';
import { api } from '../utils/api';

interface MentorChatProps {
  project: AdaptedProject;
  theme: 'dark' | 'light';
  progressPercent: number;
  completedSteps: number[];
  onClose?: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function MentorChat({
  project,
  theme: _theme,
  progressPercent,
  completedSteps,
  onClose
}: MentorChatProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Identify first incomplete step
  const activeStep = project.developmentRoadmap.find(s => !s.tasks.every(t => completedSteps.includes(t.index))) 
    || project.developmentRoadmap[project.developmentRoadmap.length - 1];

  // Initialize welcome message matching the active step
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `Hi! I'm your AI Mentor for **${project.name}**. I see you are working on **Step ${activeStep.step}: ${activeStep.title}**. Ask me any questions about wiring, coding in ${project.primaryLanguage}, database setup, or common errors!`,
        timestamp: new Date()
      }
    ]);
  }, [project.id, activeStep.step]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    const currentHistory = [...messages];
    
    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');
    setIsTyping(true);

    api.activity.mentorChat(project.id, textToSend, currentHistory, project)
      .then((data) => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: data.reply,
          timestamp: new Date()
        }]);
      })
      .catch((err) => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: `⚠️ **AI Mentor Error:** ${err.message || 'Failed to get response from server.'}`,
          timestamp: new Date()
        }]);
      });
  };

  const suggestedQuestions = [
    { text: "How do I write code for this?", icon: Terminal },
    { text: "Show me the database schema", icon: MessageSquare },
    { text: project.hardware.length > 0 ? "How do I wire components?" : "Show APIs required", icon: Sparkles },
    { text: "What are common errors here?", icon: HelpCircle }
  ];

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white cursor-pointer border border-indigo-400/20"
        title="Open AI Mentor Chat"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-2.5 -right-2.5 bg-pink-500 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border border-slate-950">
            {progressPercent}%
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
      isMaximized 
        ? 'sm:w-[480px] h-[620px] max-h-[calc(100vh-4rem)]' 
        : 'sm:w-96 h-[525px]'
    }`}>
      {/* Header bar */}
      <div 
        onClick={() => setIsOpen(false)}
        className="flex items-center justify-between px-4 py-3.5 bg-slate-900 border-b border-slate-800 cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-400 animate-pulse" />
          <span className="font-bold text-sm font-heading tracking-wide">AI Project Mentor</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
            {progressPercent}%
          </span>
        </div>
        <div className="flex items-center space-x-2.5">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            className="text-slate-400 hover:text-indigo-400 text-[9px] font-bold border border-slate-800 px-1.5 py-0.5 rounded hover:bg-slate-950 transition-all cursor-pointer"
            title={isMaximized ? "Minimize window size" : "Maximize window size"}
          >
            {isMaximized ? "Minimize" : "Maximize"}
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Minimize Chat"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {onClose && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-slate-400 hover:text-red-400 cursor-pointer"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <>
          {/* Messages list */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-950">
            {/* Scrollable instructions */}
            <div className="p-3.5 rounded-xl border mb-2 text-xxs bg-slate-900 border-slate-800 text-slate-350">
              <span className="font-bold block uppercase text-slate-550 tracking-wider mb-1.5">Next Recommended Task</span>
              <p className="font-semibold text-slate-300 leading-relaxed">
                Step {activeStep.step}: {activeStep.title} — {activeStep.description}
              </p>
            </div>

            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[9px] text-slate-550 mb-0.5 font-bold">
                  {msg.sender === 'user' ? 'You' : 'AI Mentor'}
                </span>
                <div 
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-indigo-650 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-250 rounded-tl-none'
                  }`}
                >
                  {renderMarkdown(msg.text)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-1.5 text-slate-500 pl-2">
                <span className="inline-block w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="inline-block w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="inline-block w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested options selection */}
          <div className="px-3 py-2 border-t border-slate-800/60 flex flex-wrap gap-1 bg-slate-900">
            {suggestedQuestions.map((q, i) => {
              const Icon = q.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(q.text)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-indigo-400 transition-all cursor-pointer"
                >
                  <Icon className="w-3 h-3 text-indigo-400" />
                  <span>{q.text.split('?')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Form input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMsg);
            }} 
            className="p-3 border-t border-slate-800/60 flex items-center space-x-2 bg-slate-950"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask anything..."
              className="flex-grow px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 focus:border-indigo-500 focus:bg-slate-900 text-xs font-semibold outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function renderMarkdown(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const lang = match ? match[1] : '';
      const code = match ? match[2] : part.replace(/```/g, '');
      
      return (
        <div key={i} className="my-3 rounded-xl border border-slate-850 bg-slate-950 overflow-hidden font-mono text-[10px] w-full text-left">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-850 text-[9px] font-bold text-slate-400">
            <span>{lang || 'code'}</span>
            <button 
              type="button"
              onClick={() => navigator.clipboard.writeText(code)}
              className="hover:text-indigo-400 font-semibold cursor-pointer"
            >
              Copy
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-slate-350 leading-relaxed font-mono">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    const subParts = part.split(/(\*\*.*?\*\*|`.*?`)/g);
    
    return (
      <span key={i}>
        {subParts.map((sub, j) => {
          if (sub.startsWith('**') && sub.endsWith('**')) {
            return <strong key={j} className="font-extrabold text-indigo-400">{sub.slice(2, -2)}</strong>;
          }
          if (sub.startsWith('`') && sub.endsWith('`')) {
            return <code key={j} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850 text-indigo-400 font-mono text-[10px]">{sub.slice(1, -1)}</code>;
          }
          return sub;
        })}
      </span>
    );
  });
}
