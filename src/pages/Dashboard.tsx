import { useState, useEffect, useRef } from 'react';
import { 
  Heart, Bookmark, CheckCircle2, History, Sliders, BookOpen, Clock, ChevronRight, BarChart3, Sparkles, Send
} from 'lucide-react';
import { adaptProject } from '../utils/projectAdapter';
import type { AdaptedProject } from '../utils/projectAdapter';
import { projectsDatabase } from '../data/projectsDatabase';
import { getActivity, logProjectView } from '../utils/localStorageHelper';
import { api } from '../utils/api';

interface DashboardProps {
  theme: 'dark' | 'light';
  setCurrentPage: (page: string) => void;
  setSelectedProjectId: (id: string) => void;
  profile: {
    branch: string;
    specialization: string;
    languages: string[];
    skillLevel: string;
    academicYear: string;
  } | null;
}

export default function Dashboard({
  theme,
  setCurrentPage,
  setSelectedProjectId,
  profile
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'mentor' | 'saved' | 'favorites' | 'history'>('progress');
  const [savedProjects, setSavedProjects] = useState<AdaptedProject[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<AdaptedProject[]>([]);
  const [completedProjects, setCompletedProjects] = useState<AdaptedProject[]>([]);
  const [viewedHistory, setViewedHistory] = useState<{ project: AdaptedProject; timestamp: number }[]>([]);
  const [inProgressProjects, setInProgressProjects] = useState<{ project: AdaptedProject; percent: number }[]>([]);
  const [completedStepsMap, setCompletedStepsMap] = useState<Record<string, { percent: number; completedSteps: number[] }>>({});

  // AI Mentor Workspace States
  const [selectedMentorProjectId, setSelectedMentorProjectId] = useState<string>('');
  const [mentorMessages, setMentorMessages] = useState<Record<string, { sender: 'user' | 'ai'; text: string; timestamp: Date }[]>>({});
  const [mentorInput, setMentorInput] = useState('');
  const [isMentorTyping, setIsMentorTyping] = useState(false);
  const mentorMessagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll full-screen AI chat to bottom
  useEffect(() => {
    mentorMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mentorMessages, isMentorTyping]);

  // Load and adapt projects based on activity logs
  useEffect(() => {
    if (!profile) return;

    // Fetch latest user activity stats from PostgreSQL
    api.activity.get()
      .then((actData) => {
        // Sync local storage activity cache for immediate local actions
        const act = getActivity();
        act.saved = actData.saved;
        act.favorites = actData.favorites;
        act.completed = actData.completed;
        act.history = actData.history;
        act.progress = actData.progress;
        localStorage.setItem('forge_user_activity', JSON.stringify(act));
        setCompletedStepsMap(actData.progress);

        // Map and adapt lists
        const saved = projectsDatabase
          .filter(p => actData.saved.includes(p.id))
          .map(p => adaptProject(p, profile));
        setSavedProjects(saved);

        const favs = projectsDatabase
          .filter(p => actData.favorites.includes(p.id))
          .map(p => adaptProject(p, profile));
        setFavoriteProjects(favs);

        const comps = projectsDatabase
          .filter(p => actData.completed.includes(p.id))
          .map(p => adaptProject(p, profile));
        setCompletedProjects(comps);

        const historyMapped = act.viewed
          .map(v => {
            const p = projectsDatabase.find(x => x.id === v.id);
            return p ? { project: adaptProject(p, profile), timestamp: v.timestamp } : null;
          })
          .filter((v): v is { project: AdaptedProject; timestamp: number } => v !== null);
        setViewedHistory(historyMapped);

        const progMapped = Object.keys(actData.progress)
          .map(id => {
            const p = projectsDatabase.find(x => x.id === id);
            const percent = actData.progress[id].percent;
            return p && percent < 100 ? { project: adaptProject(p, profile), percent } : null;
          })
          .filter((v): v is { project: AdaptedProject; percent: number } => v !== null);
          setInProgressProjects(progMapped);
      })
      .catch((err) => {
        console.error("Dashboard sync API error:", err);
        // Fallback to local storage cache if offline/error
        const act = getActivity();
        const saved = projectsDatabase.filter(p => act.saved.includes(p.id)).map(p => adaptProject(p, profile));
        setSavedProjects(saved);
        const favs = projectsDatabase.filter(p => act.favorites.includes(p.id)).map(p => adaptProject(p, profile));
        setFavoriteProjects(favs);
        const comps = projectsDatabase.filter(p => act.completed.includes(p.id)).map(p => adaptProject(p, profile));
        setCompletedProjects(comps);
        const historyMapped = act.viewed.map(v => {
          const p = projectsDatabase.find(x => x.id === v.id);
          return p ? { project: adaptProject(p, profile), timestamp: v.timestamp } : null;
        }).filter((v): v is { project: AdaptedProject; timestamp: number } => v !== null);
        setViewedHistory(historyMapped);
        const progMapped = Object.keys(act.progress).map(id => {
          const p = projectsDatabase.find(x => x.id === id);
          const percent = act.progress[id].percent;
          return p && percent < 100 ? { project: adaptProject(p, profile), percent } : null;
        }).filter((v): v is { project: AdaptedProject; percent: number } => v !== null);
        setInProgressProjects(progMapped);
        setCompletedStepsMap(act.progress);
      });
  }, [profile, activeTab]);

  const handleViewDetails = (id: string) => {
    logProjectView(id);
    api.activity.logView(id).catch(err => console.error("View API logging failed:", err));
    setSelectedProjectId(id);
    setCurrentPage('project-detail');
  };

  // Load projects that the user has progress tracking active for (both in progress and completed)
  const activeIds = profile ? Object.keys(getActivity().progress) : [];
  const selectProjects = profile
    ? projectsDatabase
        .filter(p => activeIds.includes(p.id))
        .map(p => adaptProject(p, profile))
    : [];

  // Default selection to the first active project
  useEffect(() => {
    if (selectProjects.length > 0 && !selectedMentorProjectId) {
      setSelectedMentorProjectId(selectProjects[0].id);
    }
  }, [selectProjects, selectedMentorProjectId]);

  // Set chatbot initial welcome message for the selected project
  useEffect(() => {
    if (!selectedMentorProjectId || selectProjects.length === 0) return;
    const currentProj = selectProjects.find(p => p.id === selectedMentorProjectId);
    if (!currentProj) return;

    const completed = completedStepsMap[selectedMentorProjectId]?.completedSteps || [];
    const activeStep = currentProj.developmentRoadmap.find(s => !s.tasks.every(t => completed.includes(t.index))) 
      || currentProj.developmentRoadmap[currentProj.developmentRoadmap.length - 1];

    if (!mentorMessages[selectedMentorProjectId]) {
      setMentorMessages(prev => ({
        ...prev,
        [selectedMentorProjectId]: [
          {
            sender: 'ai',
            text: `Hi! I'm your AI Mentor for **${currentProj.name}**. I see you are working on **Step ${activeStep.step}: ${activeStep.title}**. Ask me any questions about wiring, coding in ${currentProj.primaryLanguage}, database setup, or common errors!`,
            timestamp: new Date()
          }
        ]
      }));
    }
  }, [selectedMentorProjectId, selectProjects]);

  const handleSendMentorMessage = (textToSend: string) => {
    if (!textToSend.trim() || !selectedMentorProjectId) return;
    const currentProj = selectProjects.find(p => p.id === selectedMentorProjectId);
    if (!currentProj) return;

    const newMsg = {
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date()
    };

    const currentHistory = mentorMessages[selectedMentorProjectId] || [];

    setMentorMessages(prev => ({
      ...prev,
      [selectedMentorProjectId]: [...(prev[selectedMentorProjectId] || []), newMsg]
    }));
    setMentorInput('');
    setIsMentorTyping(true);

    api.activity.mentorChat(selectedMentorProjectId, textToSend, currentHistory, currentProj)
      .then((data) => {
        setIsMentorTyping(false);
        setMentorMessages(prev => ({
          ...prev,
          [selectedMentorProjectId]: [
            ...(prev[selectedMentorProjectId] || []),
            {
              sender: 'ai' as const,
              text: data.reply,
              timestamp: new Date()
            }
          ]
        }));
      })
      .catch((err) => {
        setIsMentorTyping(false);
        setMentorMessages(prev => ({
          ...prev,
          [selectedMentorProjectId]: [
            ...(prev[selectedMentorProjectId] || []),
            {
              sender: 'ai' as const,
              text: `⚠️ **AI Mentor Error:** ${err.message || 'Failed to get response from server.'}`,
              timestamp: new Date()
            }
          ]
        }));
      });
  };

  const handleMentorStepCheckboxChange = (projectId: string, taskIndex: number, checked: boolean) => {
    const currentProj = selectProjects.find(p => p.id === projectId);
    if (!currentProj) return;

    const currentProg = completedStepsMap[projectId] || { percent: 0, completedSteps: [] };
    const nextCompleted = checked
      ? [...currentProg.completedSteps, taskIndex]
      : currentProg.completedSteps.filter(x => x !== taskIndex);
    const totalTasks = currentProj.developmentRoadmap.reduce((acc, s) => acc + s.tasks.length, 0);
    const nextPercent = totalTasks > 0 ? Math.round((nextCompleted.length / totalTasks) * 100) : 0;

    // 1. Optimistic completedStepsMap state update
    setCompletedStepsMap(prev => ({
      ...prev,
      [projectId]: { percent: nextPercent, completedSteps: nextCompleted }
    }));

    // 2. Optimistic inProgressProjects state update
    const updatedProgMapped = inProgressProjects.map(p => {
      if (p.project.id === projectId) {
        return { ...p, percent: nextPercent };
      }
      return p;
    });
    setInProgressProjects(updatedProgMapped);

    // 3. Optimistic LocalStorage Sync
    const act = getActivity();
    act.progress[projectId] = { percent: nextPercent, completedSteps: nextCompleted };
    if (nextPercent === 100) {
      if (!act.completed.includes(projectId)) act.completed.push(projectId);
    } else {
      act.completed = act.completed.filter(x => x !== projectId);
    }
    localStorage.setItem('forge_user_activity', JSON.stringify(act));

    // 4. Send API query in background
    api.activity.updateProgress(projectId, taskIndex, checked, totalTasks)
      .then((data) => {
        // Confirm backend sync
        const actLatest = getActivity();
        actLatest.progress[projectId] = { percent: data.percent, completedSteps: data.completedSteps };
        localStorage.setItem('forge_user_activity', JSON.stringify(actLatest));

        setCompletedStepsMap(prev => ({
          ...prev,
          [projectId]: { percent: data.percent, completedSteps: data.completedSteps }
        }));
        const confirmedProgMapped = inProgressProjects.map(p => {
          if (p.project.id === projectId) {
            return { ...p, percent: data.percent };
          }
          return p;
        });
        setInProgressProjects(confirmedProgMapped);
      })
      .catch(err => {
        console.error("Step progress check failed, reverting state:", err);
        // Revert UI states
        setCompletedStepsMap(prev => ({
          ...prev,
          [projectId]: currentProg
        }));
        const revertedProgMapped = inProgressProjects.map(p => {
          if (p.project.id === projectId) {
            return { ...p, percent: currentProg.percent };
          }
          return p;
        });
        setInProgressProjects(revertedProgMapped);
        // Revert LocalStorage
        const actRevert = getActivity();
        actRevert.progress[projectId] = currentProg;
        localStorage.setItem('forge_user_activity', JSON.stringify(actRevert));
      });
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Helper stats for custom SVG analytics
  const totalSaved = savedProjects.length;
  const totalFavorites = favoriteProjects.length;
  const totalCompleted = completedProjects.length;
  const totalInProgress = inProgressProjects.length;

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="absolute top-0 right-10 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="border-b border-slate-900/10 pb-6 mb-8 relative z-10">
        <h1 className="text-3xl font-extrabold font-heading">Your Developer Workspace</h1>
        <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-655'}`}>
          Track learning progress, compile bookmarks, review stats, and access saved roadmaps.
        </p>
      </div>

      {!profile ? (
        <div className={`p-12 rounded-2xl border text-center ${
          theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'
        }`}>
          <p className="text-sm font-semibold text-amber-500 mb-4">⚠️ You have not set up your profile yet.</p>
          <button
            onClick={() => setCurrentPage('profile-setup')}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md cursor-pointer"
          >
            Configure Academic Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Left panel: Profile Stats & Analytics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Academic Profile summary card */}
            <div className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-md' : 'glass-light border-slate-200 shadow-sm'
            }`}>
              <h2 className="text-lg font-bold font-heading mb-4 border-b border-slate-900/10 pb-2 flex items-center">
                <Sliders className="w-5 h-5 mr-1.5 text-indigo-400" />
                <span>Academic Profile</span>
              </h2>
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="block text-xxs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Branch</span>
                  <span className="font-semibold">{profile.branch}</span>
                </div>
                {profile.specialization !== 'None' && (
                  <div>
                    <span className="block text-xxs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Specialization</span>
                    <span className="font-semibold">{profile.specialization}</span>
                  </div>
                )}
                <div>
                  <span className="block text-xxs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Skill Level & Year</span>
                  <span className="font-semibold">{profile.skillLevel} • {profile.academicYear}</span>
                </div>
                <div>
                  <span className="block text-xxs text-slate-500 uppercase font-bold tracking-wider mb-1.5">Languages Known</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.languages.map(lang => (
                      <span key={lang} className="text-xxs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('profile-setup')}
                className="mt-6 w-full py-2.5 rounded-xl border text-xs font-bold text-center hover:bg-indigo-500/5 transition-all"
              >
                Modify profile Details
              </button>
            </div>

            {/* Custom SVG Analytics Chart */}
            <div className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'glass-dark border-slate-800/80' : 'glass-light border-slate-200 shadow-sm'
            }`}>
              <h2 className="text-lg font-bold font-heading mb-4 border-b border-slate-900/10 pb-2 flex items-center">
                <BarChart3 className="w-5 h-5 mr-1.5 text-indigo-400" />
                <span>Activity Metrics</span>
              </h2>

              {/* Chart SVG */}
              <div className="flex items-center justify-center py-4">
                <svg className="w-full h-44" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="220" y2="20" stroke="rgba(99,102,241,0.05)" />
                  <line x1="40" y1="60" x2="220" y2="60" stroke="rgba(99,102,241,0.05)" />
                  <line x1="40" y1="100" x2="220" y2="100" stroke="rgba(99,102,241,0.05)" />
                  <line x1="40" y1="140" x2="220" y2="140" stroke="rgba(99,102,241,0.1)" strokeWidth="1.5" />
                  
                  {/* Y-Axis scale label */}
                  <text x="30" y="145" fill="rgba(156,163,175,0.8)" fontSize="9" fontWeight="bold" textAnchor="end">0</text>
                  <text x="30" y="85" fill="rgba(156,163,175,0.8)" fontSize="9" fontWeight="bold" textAnchor="end">5</text>
                  <text x="30" y="25" fill="rgba(156,163,175,0.8)" fontSize="9" fontWeight="bold" textAnchor="end">10</text>

                  {/* Bars */}
                  {/* Active (In Progress) */}
                  <rect 
                    x="55" 
                    y={Math.max(20, 140 - totalInProgress * 12)} 
                    width="24" 
                    height={totalInProgress * 12} 
                    fill="url(#progGrad)" 
                    rx="4"
                  />
                  {/* Bookmarks (Saved) */}
                  <rect 
                    x="95" 
                    y={Math.max(20, 140 - totalSaved * 12)} 
                    width="24" 
                    height={totalSaved * 12} 
                    fill="url(#saveGrad)" 
                    rx="4"
                  />
                  {/* Hearts (Favorites) */}
                  <rect 
                    x="135" 
                    y={Math.max(20, 140 - totalFavorites * 12)} 
                    width="24" 
                    height={totalFavorites * 12} 
                    fill="url(#favGrad)" 
                    rx="4"
                  />
                  {/* Finished (Completed) */}
                  <rect 
                    x="175" 
                    y={Math.max(20, 140 - totalCompleted * 12)} 
                    width="24" 
                    height={totalCompleted * 12} 
                    fill="url(#compGrad)" 
                    rx="4"
                  />

                  {/* X-axis labels */}
                  <text x="67" y="156" fill="rgba(156,163,175,0.7)" fontSize="8.5" fontWeight="bold" textAnchor="middle">Active</text>
                  <text x="107" y="156" fill="rgba(156,163,175,0.7)" fontSize="8.5" fontWeight="bold" textAnchor="middle">Saved</text>
                  <text x="147" y="156" fill="rgba(156,163,175,0.7)" fontSize="8.5" fontWeight="bold" textAnchor="middle">Favs</text>
                  <text x="187" y="156" fill="rgba(156,163,175,0.7)" fontSize="8.5" fontWeight="bold" textAnchor="middle">Done</text>

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <linearGradient id="saveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>
                    <linearGradient id="favGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#701a75" />
                    </linearGradient>
                    <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#064e3b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Total stat indicators */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-center text-xs border-t border-slate-900/10 pt-4">
                <div>
                  <span className="text-slate-500 font-bold block">In Progress</span>
                  <span className="font-extrabold text-indigo-400 text-lg">{totalInProgress}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Completed</span>
                  <span className="font-extrabold text-green-400 text-lg">{totalCompleted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Tabbed Activity lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab selection buttons */}
            <div className="flex border-b border-slate-900/10">
              {[
                { id: 'progress', label: 'Active Projects', icon: Clock },
                { id: 'mentor', label: 'AI Mentor', icon: Sparkles },
                { id: 'saved', label: 'Bookmarks', icon: Bookmark },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'history', label: 'History log', icon: History }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1.5 pb-3.5 px-4 text-sm font-semibold tracking-wide border-b-2 -mb-0.5 transition-all ${
                      isActive
                        ? 'border-indigo-500 text-indigo-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* List Containers based on Tab */}
            <div className="space-y-4">
              {/* 1. Active Projects Tab */}
              {activeTab === 'progress' && (
                <>
                  {inProgressProjects.length > 0 ? (
                    inProgressProjects.map(({ project, percent }) => (
                      <div
                        key={project.id}
                        onClick={() => handleViewDetails(project.id)}
                        className={`p-5 rounded-2xl border transition-all hover:border-slate-800 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          theme === 'dark' ? 'bg-slate-925/40 border-slate-900' : 'bg-white border-slate-100 shadow-sm'
                        }`}
                      >
                        <div className="space-y-1.5 flex-grow">
                          <h3 className="font-bold text-base hover:text-indigo-400 transition-colors">{project.name}</h3>
                          <p className="text-xs text-slate-500 font-semibold">{project.branch.replace(' Engineering', '')}</p>
                          {/* Progress bar */}
                          <div className="flex items-center space-x-3 w-full max-w-sm pt-2">
                            <div className={`h-1.5 rounded-full w-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-xs font-extrabold text-indigo-400">{percent}%</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0 self-center hidden sm:block" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-sm text-slate-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-3.5 text-slate-600" />
                      <p className="font-medium mb-4">No active project blueprints tracked.</p>
                      <button
                        onClick={() => setCurrentPage('recommendations')}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-sm cursor-pointer"
                      >
                        Find Recommendations
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* 2. AI Mentor Workspace Tab */}
              {activeTab === 'mentor' && (
                <>
                  {selectProjects.length === 0 ? (
                    <div className={`text-center py-16 rounded-2xl border ${
                      theme === 'dark' ? 'glass-dark border-slate-900' : 'glass-light border-slate-200'
                    }`}>
                      <Sparkles className="w-8 h-8 mx-auto mb-3.5 text-indigo-400 animate-pulse" />
                      <p className="font-semibold text-sm mb-4">No active projects in build mode.</p>
                      <p className={`text-xs max-w-sm mx-auto mb-6 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Select a recommended project from your feed and click **Start Building** to activate progress tracking and enable the AI Mentor console.
                      </p>
                      <button
                        onClick={() => setCurrentPage('recommendations')}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md cursor-pointer"
                      >
                        Browse Blueprint Catalog
                      </button>
                    </div>
                  ) : (() => {
                    const currentProj = selectProjects.find(p => p.id === selectedMentorProjectId);
                    if (!currentProj) return <div className="text-slate-500 text-sm">Please select a project to begin.</div>;

                    const currentMessages = mentorMessages[selectedMentorProjectId] || [];
                    const currentCompleted = completedStepsMap[selectedMentorProjectId]?.completedSteps || [];
                    const currentPercent = completedStepsMap[selectedMentorProjectId]?.percent || 0;
                    const activeStep = currentProj.developmentRoadmap.find(s => !s.tasks.every(t => currentCompleted.includes(t.index))) 
                      || currentProj.developmentRoadmap[currentProj.developmentRoadmap.length - 1];

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                        <div className={`lg:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border ${
                          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                            <span className="text-xs font-bold text-slate-500">Select Project:</span>
                            <select
                              value={selectedMentorProjectId}
                              onChange={(e) => setSelectedMentorProjectId(e.target.value)}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                                theme === 'dark'
                                  ? 'border-slate-800 bg-slate-950 text-slate-200 focus:border-indigo-550'
                                  : 'border-slate-250 bg-white text-slate-800 focus:border-indigo-500'
                              }`}
                            >
                              {selectProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => handleViewDetails(selectedMentorProjectId)}
                            className="px-4 py-2 rounded-xl border text-xs font-bold text-indigo-400 hover:text-indigo-300 border-indigo-500/20 bg-indigo-500/5 cursor-pointer self-start sm:self-auto"
                          >
                            Open Roadmap Details →
                          </button>
                        </div>

                        <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col h-[520px] overflow-hidden ${
                          theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                        }`}>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1.5 text-indigo-400" />
                            <span>Roadmap Progress</span>
                          </h3>
                          <div className="flex items-center space-x-3 w-full mb-5">
                            <div className={`h-1.5 rounded-full w-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${currentPercent}%` }} />
                            </div>
                            <span className="text-xs font-extrabold text-indigo-400">{currentPercent}%</span>
                          </div>

                          <div className="flex-grow overflow-y-auto space-y-4 pr-1 text-xs">
                            {currentProj.developmentRoadmap.map((step) => {
                              const isStepActive = activeStep.step === step.step;
                              const isStepCompleted = step.tasks.every(t => currentCompleted.includes(t.index));
                              return (
                                <div key={step.step} className="space-y-2">
                                  <div className={`p-2.5 rounded-xl border font-bold text-[11px] ${
                                    isStepActive 
                                      ? 'border-indigo-500/20 bg-indigo-550/5 text-indigo-400' 
                                      : isStepCompleted
                                      ? 'border-green-500/10 bg-green-500/5 text-slate-500 line-through opacity-70'
                                      : theme === 'dark' ? 'border-slate-850 bg-slate-900/10 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                                  }`}>
                                    Step {step.step}: {step.title}
                                  </div>
                                  <div className="pl-3 space-y-1.5 border-l border-slate-800/20 ml-2">
                                    {step.tasks.map(t => {
                                      const isTaskCompleted = currentCompleted.includes(t.index);
                                      return (
                                        <div key={t.index} className={`flex items-start space-x-2.5 p-2 rounded-lg border text-[10px] ${
                                          isTaskCompleted ? 'border-green-500/10 bg-green-500/5 text-slate-500 line-through opacity-75' : theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-350' : 'border-slate-150 bg-white text-slate-650'
                                        }`}>
                                          <input
                                            type="checkbox"
                                            checked={isTaskCompleted}
                                            onChange={(e) => handleMentorStepCheckboxChange(currentProj.id, t.index, e.target.checked)}
                                            className="mt-0.5 w-3 h-3 text-indigo-500 border-slate-800 rounded bg-slate-900 cursor-pointer focus:ring-indigo-500"
                                          />
                                          <div className="space-y-0.5">
                                            <span className="font-bold">{t.title}</span>
                                            <p className="text-[9px] text-slate-550">{t.description}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className={`lg:col-span-8 p-5 rounded-2xl border flex flex-col h-[520px] overflow-hidden ${
                          theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                        }`}>
                          <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-4 text-xs">
                            {currentMessages.map((msg, i) => (
                              <div 
                                key={i} 
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                              >
                                <span className="text-[9px] text-slate-500 mb-0.5 font-bold">
                                  {msg.sender === 'user' ? 'You' : 'AI Mentor'}
                                </span>
                                <div 
                                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                                    msg.sender === 'user'
                                      ? 'bg-indigo-650 text-white rounded-tr-none'
                                      : theme === 'dark'
                                      ? 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none shadow-sm'
                                      : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none shadow-sm'
                                  }`}
                                  style={{ whiteSpace: 'pre-wrap' }}
                                >
                                  {msg.sender === 'user' ? msg.text : renderMarkdown(msg.text)}
                                </div>
                              </div>
                            ))}
                            {isMentorTyping && (
                              <div className="flex items-center space-x-1.5 text-slate-500 pl-2">
                                <span className="inline-block w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="inline-block w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="inline-block w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            )}
                            <div ref={mentorMessagesEndRef} />
                          </div>

                          {/* Quick shortcuts */}
                          <div className="flex flex-wrap gap-1.5 mb-3 border-t border-slate-850/40 pt-3">
                            {[
                              { text: "📝 Explain active step", prompt: "How do I implement the current active step in this project?" },
                              { text: "💻 Code help", prompt: "Can you write the starter code or main logic for the current step?" },
                              { text: "🔧 Debug errors", prompt: "I am facing errors running this step. What are common bugs and how do I debug them?" },
                              { text: "📄 Resume bullets", prompt: "Can you generate 3 premium resume bullet points for this project based on my profile?" },
                              { text: "🎓 Mock viva", prompt: "Ask me a mock viva question for this project and verify my answer." },
                              { text: "🚀 Enhancements", prompt: "What are some future enhancements or features I can add to this project?" }
                            ].map((act, i) => (
                              <button
                                type="button"
                                key={i}
                                onClick={() => handleSendMentorMessage(act.prompt)}
                                disabled={isMentorTyping}
                                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
                                  theme === 'dark'
                                    ? 'border-slate-850 bg-slate-950 text-slate-350 hover:border-slate-700 hover:text-indigo-400'
                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-indigo-600'
                                }`}
                              >
                                {act.text}
                              </button>
                            ))}
                          </div>

                          {/* Form Input */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMentorMessage(mentorInput);
                            }} 
                            className="flex items-center space-x-2 border-t border-slate-850/40 pt-3"
                          >
                            <input
                              type="text"
                              value={mentorInput}
                              onChange={(e) => setMentorInput(e.target.value)}
                              placeholder="Ask AI Mentor anything..."
                              className={`flex-grow px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                                theme === 'dark'
                                  ? 'border-slate-800 bg-slate-900 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                                  : 'border-slate-250 bg-white text-slate-850 focus:border-indigo-500'
                              }`}
                            />
                            <button
                              type="submit"
                              disabled={!mentorInput.trim() || isMentorTyping}
                              className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* 3. Saved Tab */}
              {activeTab === 'saved' && (
                <>
                  {savedProjects.length > 0 ? (
                    savedProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleViewDetails(project.id)}
                        className={`p-5 rounded-2xl border transition-all hover:border-slate-800 cursor-pointer flex items-center justify-between gap-4 ${
                          theme === 'dark' ? 'bg-slate-925/40 border-slate-900' : 'bg-white border-slate-100 shadow-sm'
                        }`}
                      >
                        <div>
                          <h3 className="font-bold text-base hover:text-indigo-400 transition-colors">{project.name}</h3>
                          <p className="text-xs text-slate-550 font-semibold mt-1">{project.branch.replace(' Engineering', '')} • {project.difficultyLevel}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-sm text-slate-500">
                      <Bookmark className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                      <p className="font-medium">No bookmarked projects.</p>
                    </div>
                  )}
                </>
              )}

              {/* 3. Favorites Tab */}
              {activeTab === 'favorites' && (
                <>
                  {favoriteProjects.length > 0 ? (
                    favoriteProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleViewDetails(project.id)}
                        className={`p-5 rounded-2xl border transition-all hover:border-slate-800 cursor-pointer flex items-center justify-between gap-4 ${
                          theme === 'dark' ? 'bg-slate-925/40 border-slate-900' : 'bg-white border-slate-100 shadow-sm'
                        }`}
                      >
                        <div>
                          <h3 className="font-bold text-base hover:text-indigo-400 transition-colors">{project.name}</h3>
                          <p className="text-xs text-slate-550 font-semibold mt-1">{project.branch.replace(' Engineering', '')} • {project.difficultyLevel}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-sm text-slate-500">
                      <Heart className="w-8 h-8 mx-auto mb-3 text-slate-600 animate-pulse" />
                      <p className="font-medium">No projects added to favorites.</p>
                    </div>
                  )}
                </>
              )}

              {/* 4. History Tab */}
              {activeTab === 'history' && (
                <>
                  {viewedHistory.length > 0 ? (
                    viewedHistory.map(({ project, timestamp }) => (
                      <div
                        key={`${project.id}-${timestamp}`}
                        onClick={() => handleViewDetails(project.id)}
                        className={`p-5 rounded-2xl border transition-all hover:border-slate-800 cursor-pointer flex items-center justify-between gap-4 ${
                          theme === 'dark' ? 'bg-slate-925/40 border-slate-900' : 'bg-white border-slate-100 shadow-sm'
                        }`}
                      >
                        <div>
                          <h3 className="font-bold text-base hover:text-indigo-400 transition-colors">{project.name}</h3>
                          <p className="text-xs text-slate-550 font-semibold mt-1 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>Viewed {formatTimeAgo(timestamp)}</span>
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-sm text-slate-500">
                      <History className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                      <p className="font-medium">No recently viewed history logs.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Completed Projects board footer */}
            {completedProjects.length > 0 && (
              <div className={`p-6 rounded-2xl border mt-8 ${
                theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'
              }`}>
                <h3 className="font-bold font-heading mb-4 text-green-400 flex items-center text-base">
                  <CheckCircle2 className="w-5 h-5 mr-1.5 text-green-400" />
                  <span>Completed Masterpieces ({totalCompleted})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {completedProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleViewDetails(project.id)}
                      className={`p-4 rounded-xl border border-green-500/10 bg-green-500/5 hover:border-green-500/25 transition-all cursor-pointer ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      <span className="font-semibold text-sm line-clamp-1">{project.name}</span>
                      <span className="block text-xxs text-green-500 mt-1">100% Cured</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
