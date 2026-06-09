import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Heart, Bookmark, CheckCircle2, Clock, DollarSign, 
  HelpCircle, Clipboard, ClipboardCheck, Sparkles, BookOpen, AlertTriangle, FileCode, Play,
  Send, ChevronDown, ChevronUp
} from 'lucide-react';
import type { AdaptedProject } from '../utils/projectAdapter';
import { getActivity } from '../utils/localStorageHelper';
import { api } from '../utils/api';
import MentorChat from '../components/MentorChat';

interface ProjectDetailProps {
  project: AdaptedProject;
  theme: 'dark' | 'light';
  setCurrentPage: (page: string) => void;
}

export default function ProjectDetail({
  project,
  theme,
  setCurrentPage
}: ProjectDetailProps) {
  // Activity Sync States
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);

  // UI Interactive States
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [vivaOpenIdx, setVivaOpenIdx] = useState<number | null>(null);

  // Roadmap & AI Doubts States
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [stepChats, setStepChats] = useState<Record<number, { sender: 'user' | 'ai'; text: string }[]>>({});
  const [stepChatInputs, setStepChatInputs] = useState<Record<number, string>>({});
  const [isStepChatTyping, setIsStepChatTyping] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const act = getActivity();
    setIsSaved(act.saved.includes(project.id));
    setIsFavorite(act.favorites.includes(project.id));
    
    const projProgress = act.progress[project.id];
    if (projProgress) {
      setIsBuilding(true);
      setCompletedSteps(projProgress.completedSteps);
      setProgressPercent(projProgress.percent);
    } else {
      setIsBuilding(false);
      setCompletedSteps([]);
      setProgressPercent(0);
    }
  }, [project.id]);

  const handleToggleSave = () => {
    api.activity.toggleSave(project.id)
      .then((data) => {
        const act = getActivity();
        act.saved = data.isSaved ? [...act.saved, project.id] : act.saved.filter(x => x !== project.id);
        localStorage.setItem('forge_user_activity', JSON.stringify(act));
        setIsSaved(data.isSaved);
      })
      .catch(err => console.error("Toggle Save failed:", err));
  };

  const handleToggleFavorite = () => {
    api.activity.toggleFavorite(project.id)
      .then((data) => {
        const act = getActivity();
        act.favorites = data.isFavorite ? [...act.favorites, project.id] : act.favorites.filter(x => x !== project.id);
        localStorage.setItem('forge_user_activity', JSON.stringify(act));
        setIsFavorite(data.isFavorite);
      })
      .catch(err => console.error("Toggle Favorite failed:", err));
  };

  const handleStartBuilding = () => {
    if (!isBuilding) {
      setIsBuilding(true);
      const totalTasks = project.developmentRoadmap.reduce((acc, s) => acc + s.tasks.length, 0);
      api.activity.updateProgress(project.id, -1, false, totalTasks)
        .then((data) => {
          const act = getActivity();
          act.progress[project.id] = { percent: data.percent, completedSteps: data.completedSteps };
          localStorage.setItem('forge_user_activity', JSON.stringify(act));
          setProgressPercent(data.percent);
        })
        .catch(err => console.error("Start Building failed:", err));
    }
  };

  const handleStepCheckboxChange = (taskIndex: number, checked: boolean) => {
    const nextCompleted = checked
      ? [...completedSteps, taskIndex]
      : completedSteps.filter(x => x !== taskIndex);
    const totalTasks = project.developmentRoadmap.reduce((acc, s) => acc + s.tasks.length, 0);
    const nextPercent = totalTasks > 0 ? Math.round((nextCompleted.length / totalTasks) * 100) : 0;

    // 1. Optimistic State Update
    setCompletedSteps(nextCompleted);
    setProgressPercent(nextPercent);

    // 2. Optimistic LocalStorage Sync
    const act = getActivity();
    act.progress[project.id] = { percent: nextPercent, completedSteps: nextCompleted };
    if (nextPercent === 100) {
      if (!act.completed.includes(project.id)) act.completed.push(project.id);
    } else {
      act.completed = act.completed.filter(x => x !== project.id);
    }
    localStorage.setItem('forge_user_activity', JSON.stringify(act));

    // 3. Sync Background API request
    api.activity.updateProgress(project.id, taskIndex, checked, totalTasks)
      .then((data) => {
        // Double check response
        const actLatest = getActivity();
        actLatest.progress[project.id] = { percent: data.percent, completedSteps: data.completedSteps };
        localStorage.setItem('forge_user_activity', JSON.stringify(actLatest));
        setCompletedSteps(data.completedSteps);
        setProgressPercent(data.percent);
      })
      .catch(err => {
        console.error("Step progress check failed, reverting state:", err);
        // Revert UI State
        setCompletedSteps(completedSteps);
        setProgressPercent(progressPercent);
        // Revert LocalStorage
        const actRevert = getActivity();
        actRevert.progress[project.id] = { percent: progressPercent, completedSteps: completedSteps };
        localStorage.setItem('forge_user_activity', JSON.stringify(actRevert));
      });
  };

  const toggleStepExpanded = (stepNum: number) => {
    setExpandedSteps(prev => 
      prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]
    );
  };

  const handleSendStepChat = (stepNum: number, stepTitle: string) => {
    const input = stepChatInputs[stepNum] || '';
    if (!input.trim()) return;

    const newMsg = { sender: 'user' as const, text: input };
    setStepChats(prev => ({
      ...prev,
      [stepNum]: [...(prev[stepNum] || []), newMsg]
    }));
    setStepChatInputs(prev => ({ ...prev, [stepNum]: '' }));
    setIsStepChatTyping(prev => ({ ...prev, [stepNum]: true }));

    const contextPrompt = `Context: I am working on Step ${stepNum}: "${stepTitle}" for the project "${project.name}". The primary programming language is ${project.primaryLanguage}. My specific question/doubt about this step is: "${input}"`;

    const chatHistory = (stepChats[stepNum] || []).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    api.activity.mentorChat(project.id, contextPrompt, chatHistory, project)
      .then((data) => {
        setIsStepChatTyping(prev => ({ ...prev, [stepNum]: false }));
        setStepChats(prev => ({
          ...prev,
          [stepNum]: [...(prev[stepNum] || []), { sender: 'ai' as const, text: data.reply }]
        }));
      })
      .catch((err) => {
        setIsStepChatTyping(prev => ({ ...prev, [stepNum]: false }));
        setStepChats(prev => ({
          ...prev,
          [stepNum]: [...(prev[stepNum] || []), { sender: 'ai' as const, text: `⚠️ **AI Error:** ${err.message || 'Failed to get response from server.'}` }]
        }));
      });
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Node position map for interactive SVG
  const nodePositions: Record<string, { x: number; y: number }> = {
    usr: { x: 30, y: 90 },
    sens: { x: 105, y: 35 },
    mcu: { x: 105, y: 90 },
    act: { x: 105, y: 145 },
    srv: { x: 180, y: 90 },
    db: { x: 255, y: 45 },
    cld: { x: 255, y: 135 }
  };

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
      {/* Background patterns */}
      <div className="absolute top-0 right-10 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Navigation and Actions row */}
      <div className="flex items-center justify-between border-b border-slate-900/10 pb-5 mb-8 relative z-10">
        <button
          onClick={() => setCurrentPage('recommendations')}
          className={`px-4 py-2 rounded-xl border text-sm font-semibold flex items-center space-x-1.5 transition-all ${
            theme === 'dark' ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-900' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isFavorite ? 'border-red-500/20 bg-red-500/10 text-red-500' : theme === 'dark' ? 'border-slate-800 text-slate-400 hover:text-red-400' : 'border-slate-200 text-slate-500 hover:text-red-500'
            }`}
            title="Add to Favorites"
          >
            <Heart className="w-4.5 h-4.5 fill-current" />
          </button>
          <button
            onClick={handleToggleSave}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isSaved ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400' : theme === 'dark' ? 'border-slate-800 text-slate-400 hover:text-indigo-400' : 'border-slate-200 text-slate-500 hover:text-indigo-500'
            }`}
            title="Bookmark Project"
          >
            <Bookmark className="w-4.5 h-4.5 fill-current" />
          </button>
          {!isBuilding ? (
            <button
              onClick={handleStartBuilding}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-700 shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Start Building</span>
            </button>
          ) : (
            <span className="px-4 py-2.5 rounded-xl text-sm font-bold border border-green-550/20 bg-green-500/10 text-green-400 flex items-center space-x-1">
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>In Progress ({progressPercent}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left column: Name, Summary and Requirements */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Project Title and Tags */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading leading-tight">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border tracking-wider uppercase ${
                project.difficultyLevel === 'Beginner' ? 'text-green-400 bg-green-500/10 border-green-550/20' : project.difficultyLevel === 'Intermediate' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-555/20' : 'text-pink-400 bg-pink-500/10 border-pink-550/20'
              }`}>
                {project.difficultyLevel}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${theme === 'dark' ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
                {project.branch}
              </span>
              {project.specialization !== 'None' && (
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${theme === 'dark' ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
                  {project.specialization}
                </span>
              )}
            </div>

            {/* Time / Cost estimates */}
            <div className="grid grid-cols-2 gap-4 max-w-sm pt-2">
              <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-150 shadow-sm'}`}>
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completion Time</span>
                  <span className="text-xs font-bold">{project.estimatedCompletionTime}</span>
                </div>
              </div>
              <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-150 shadow-sm'}`}>
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Est. Budget</span>
                  <span className="text-xs font-bold">{project.costEstimation === 0 ? 'Free (Software)' : `$${project.costEstimation}`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Problem & Objective Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-925/55 border-slate-900' : 'bg-white border-slate-150 shadow-sm'}`}>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-indigo-400" />
                <span>Problem Statement</span>
              </h3>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-650'}`}>
                {project.problemStatement}
              </p>
            </div>
            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-925/55 border-slate-900' : 'bg-white border-slate-150 shadow-sm'}`}>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-1.5 text-indigo-400" />
                <span>Project Objective</span>
              </h3>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-655'}`}>
                {project.objective}
              </p>
            </div>
          </div>

          {/* System Architecture (Interactive SVG) */}
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'}`}>
            <h3 className="font-extrabold font-heading text-lg mb-2">System Architecture Flow</h3>
            <p className="text-xs text-slate-500 mb-6">Hover over any system component to view its operational role details.</p>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* SVG Block diagram */}
              <div className={`w-full max-w-sm p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'}`}>
                <svg className="w-full h-44" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
                  {/* Arrow marker */}
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 2 L 10 5 L 0 8 z" fill="rgba(99,102,241,0.5)" />
                    </marker>
                  </defs>

                  {/* Render Connections */}
                  {project.systemArchitecture.connections.map((c, i) => {
                    const fromPos = nodePositions[c.from];
                    const toPos = nodePositions[c.to];
                    if (!fromPos || !toPos) return null;
                    return (
                      <g key={i}>
                        <line 
                          x1={fromPos.x} 
                          y1={fromPos.y} 
                          x2={toPos.x} 
                          y2={toPos.y} 
                          stroke="rgba(99,102,241,0.25)" 
                          strokeWidth="1.5" 
                          markerEnd="url(#arrow)" 
                        />
                      </g>
                    );
                  })}

                  {/* Render Nodes */}
                  {project.systemArchitecture.nodes.map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;
                    const isHovered = hoveredNode === node.id;
                    const fillCol = node.type === 'hardware' ? '#ec4899' : node.type === 'software' ? '#6366f1' : node.type === 'database' ? '#10b981' : '#8b5cf6';
                    return (
                      <g 
                        key={node.id}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer"
                      >
                        <circle 
                          cx={pos.x} 
                          cy={pos.y} 
                          r={isHovered ? "18" : "14"} 
                          fill={fillCol} 
                          opacity={isHovered ? "0.3" : "0.15"} 
                          className="transition-all"
                        />
                        <circle 
                          cx={pos.x} 
                          cy={pos.y} 
                          r="8" 
                          fill={fillCol} 
                        />
                        <text 
                          x={pos.x} 
                          y={pos.y + (node.id === 'usr' || node.id === 'act' ? 24 : -16)} 
                          fill={theme === 'dark' ? '#9ca3af' : '#4b5563'} 
                          fontSize="7.5" 
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {node.label.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Node description card */}
              <div className="flex-grow space-y-2.5">
                {hoveredNode ? (() => {
                  const node = project.systemArchitecture.nodes.find(n => n.id === hoveredNode);
                  return (
                    <div className="animate-float-delayed">
                      <span className="text-xxs font-extrabold uppercase text-indigo-400 tracking-wider">
                        {node?.type}
                      </span>
                      <h4 className="font-bold text-sm text-slate-350">{node?.label}</h4>
                      <p className={`text-xs leading-relaxed mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {node?.description}
                      </p>
                    </div>
                  );
                })() : (
                  <div className="text-slate-500 text-xs italic py-4">
                    Hover over the layout grid connectors to inspect protocol streams.
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Folder Structure */}
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'}`}>
            <h3 className="font-extrabold font-heading text-lg mb-2">Project Folder Structure</h3>
            <p className="text-xs text-slate-500 mb-5">Typical code repository tree layout for **{project.primaryLanguage}** environments.</p>

            <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-900 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-700'
            }`}>
              <pre>{project.folderStructure}</pre>
            </div>
          </div>

          {/* Source Code Explanation */}
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'}`}>
            <h3 className="font-extrabold font-heading text-lg mb-4">Source Code File Guide</h3>
            <div className="space-y-4">
              {project.sourceCodeStructureExplanation.map((file, i) => (
                <div key={i} className="flex items-start space-x-3 text-sm">
                  <FileCode className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-350">{file.file}</span>
                    <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {file.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'}`}>
            <h3 className="font-extrabold font-heading text-lg mb-4">Required API Interfaces</h3>
            <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'border-slate-850' : 'border-slate-200'}`}>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`font-bold ${theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                    <th className="px-4 py-2.5">Endpoint</th>
                    <th className="px-4 py-2.5">Method</th>
                    <th className="px-4 py-2.5">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {project.apisRequired.map((api, i) => (
                    <tr key={i} className={`border-t ${theme === 'dark' ? 'border-slate-850' : 'border-slate-150'}`}>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">{api.route}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white ${
                          api.method === 'POST' ? 'bg-blue-600' : api.method === 'GET' ? 'bg-green-600' : 'bg-purple-600'
                        }`}>
                          {api.method}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{api.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Testing & Troubleshooting */}
          <div className={`p-6 rounded-2xl border space-y-6 ${theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'}`}>
            <h3 className="font-extrabold font-heading text-lg mb-2">Testing & Debugging Procedures</h3>

            {/* Testing commands */}
            <div>
              <h4 className="font-bold text-sm mb-3">Validation Tests</h4>
              <div className="space-y-3">
                {project.testingProcedures.map((t, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'}`}>
                    <span className="text-xxs font-extrabold uppercase text-slate-550 block mb-1">{t.type}</span>
                    <code className="block font-mono text-xs font-bold text-indigo-400 mb-1.5">{t.command}</code>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{t.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common errors and troubleshooting */}
            <div className="border-t border-slate-900/10 pt-6">
              <h4 className="font-bold text-sm mb-4">Troubleshooting Obstacles</h4>
              <div className="space-y-4">
                {project.commonErrors.map((err, i) => (
                  <div key={i} className="text-xs space-y-1">
                    <span className="font-bold text-red-400 block">⚠️ Error: {err.error}</span>
                    <span className="block text-slate-500">Context: {err.context}</span>
                    <span className="block text-slate-350">💡 Fix: {err.fix}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Viva Questions */}
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'}`}>
            <h3 className="font-extrabold font-heading text-lg mb-2">Viva / Oral Exam Prep</h3>
            <p className="text-xs text-slate-500 mb-5">Click on any card to reveal its answer response.</p>

            <div className="space-y-4">
              {project.vivaQuestions.map((v, i) => {
                const isOpen = vivaOpenIdx === i;
                return (
                  <div 
                    key={i} 
                    onClick={() => setVivaOpenIdx(isOpen ? null : i)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isOpen 
                        ? 'border-indigo-500/30 bg-indigo-500/5' 
                        : theme === 'dark' 
                        ? 'border-slate-850 hover:border-slate-700 bg-slate-900/10' 
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm text-slate-350">
                      <span>Q: {v.question}</span>
                      <HelpCircle className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 ml-2" />
                    </div>
                    {isOpen && (
                      <p className={`text-xs mt-3 leading-relaxed border-t border-slate-900/10 pt-3 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-605'
                      }`}>
                        <strong>A:</strong> {v.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resume Description */}
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold font-heading text-lg">Resume Bullet Points</h3>
              <button
                onClick={() => copyToClipboard(project.resumeDescription.join('\n'), setCopiedResume)}
                className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 ${
                  copiedResume ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-slate-400 hover:text-indigo-400 hover:border-slate-800'
                }`}
              >
                {copiedResume ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                <span>{copiedResume ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <ul className="space-y-2.5 text-xs list-disc pl-4 leading-relaxed">
              {project.resumeDescription.map((item, i) => (
                <li key={i} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-655'}>{item}</li>
              ))}
            </ul>
          </div>

          {/* GitHub Readme Template */}
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'glass-dark border-slate-800' : 'glass-light border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold font-heading text-lg">GitHub README Markdown</h3>
              <button
                onClick={() => copyToClipboard(project.githubReadmeTemplate, setCopiedReadme)}
                className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 ${
                  copiedReadme ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-slate-400 hover:text-indigo-400'
                }`}
              >
                {copiedReadme ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                <span>{copiedReadme ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>
            <div className={`p-4 rounded-xl border font-mono text-xs max-h-80 overflow-y-auto ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-150 text-slate-700'
            }`}>
              <pre>{project.githubReadmeTemplate}</pre>
            </div>
          </div>
        </div>

        {/* Right column: Linear Roadmap & Mentor Interface */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-2xl border sticky top-20 max-h-[85vh] overflow-y-auto ${
            theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-md' : 'glass-light border-slate-200 shadow-sm'
          }`}>
            <h3 className="font-extrabold font-heading text-base mb-1.5 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-1.5 text-indigo-400" />
              <span>Development Roadmap</span>
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">Complete specific implementation tasks below to make progress.</p>

            {/* Total sub-tasks progress bar */}
            <div className="mb-5 p-3 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                <span>PROJECT COMPLETE RATE</span>
                <span className="text-indigo-400">{progressPercent}%</span>
              </div>
              <div className={`h-1.5 rounded-full w-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="space-y-5">
              {project.developmentRoadmap.map((step) => {
                const isStepCompleted = step.tasks.every(t => completedSteps.includes(t.index));
                const isStepActive = project.developmentRoadmap.find(s => !s.tasks.every(t => completedSteps.includes(t.index)))?.step === step.step;
                const isExpanded = expandedSteps.includes(step.step);

                return (
                  <div 
                    key={step.step}
                    className={`p-4 rounded-xl border transition-all space-y-3.5 ${
                      isStepCompleted 
                        ? 'border-green-500/15 bg-green-500/5 opacity-80' 
                        : isStepActive
                        ? 'border-indigo-500/30 bg-indigo-550/5 ring-1 ring-indigo-500/10'
                        : theme === 'dark' 
                        ? 'border-slate-850 bg-slate-900/10' 
                        : 'border-slate-200 bg-white shadow-sm'
                    }`}
                  >
                    {/* Step Header */}
                    <div 
                      onClick={() => toggleStepExpanded(step.step)}
                      className="flex items-center justify-between cursor-pointer hover:text-indigo-400 transition-colors select-none"
                    >
                      <span className={`font-bold block text-xs ${isStepCompleted ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        Step {step.step}: {step.title}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {isStepCompleted && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 uppercase">
                            Cured
                          </span>
                        )}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </div>

                    {/* Step Description */}
                    <p className={`text-[10px] leading-relaxed ${isStepCompleted ? 'text-slate-550' : 'text-slate-450'}`}>
                      {step.description}
                    </p>

                    {/* Implementation Tasks Checklist */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide block">Implementation Tasks</span>
                      {step.tasks.map(t => {
                        const isTaskCompleted = completedSteps.includes(t.index);
                        return (
                          <div 
                            key={t.index}
                            className={`flex items-start space-x-2.5 p-2.5 rounded-lg border text-[10px] transition-all ${
                              isTaskCompleted 
                                ? 'border-green-500/5 bg-green-500/5 text-slate-500 line-through opacity-75' 
                                : theme === 'dark' 
                                ? 'border-slate-900/40 bg-slate-950/20 text-slate-350' 
                                : 'border-slate-150 bg-slate-50/50 text-slate-655 text-slate-600 shadow-sm'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isTaskCompleted}
                              onChange={(e) => handleStepCheckboxChange(t.index, e.target.checked)}
                              disabled={!isBuilding}
                              className="mt-0.5 w-3.5 h-3.5 text-indigo-500 border-slate-800 rounded bg-slate-900 focus:ring-indigo-500 focus:ring-opacity-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                            <div className="space-y-0.5">
                              <span className="font-bold">{t.title}</span>
                              <p className="text-[9px] text-slate-500 leading-normal">{t.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Expandable Help & Doubts Panel */}
                    <div className="pt-2 border-t border-slate-850/40">
                      <button
                        type="button"
                        onClick={() => toggleStepExpanded(step.step)}
                        className={`w-full py-2 px-3 rounded-lg border text-[10px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          isExpanded
                            ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                            : theme === 'dark'
                            ? 'border-slate-800 bg-slate-950/45 text-slate-400 hover:border-slate-700 hover:text-indigo-400'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-indigo-600'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Need Help?</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className={`mt-3 p-3.5 rounded-xl border space-y-4 text-[10px] leading-relaxed text-left transition-all ${
                          theme === 'dark' ? 'bg-slate-950/70 border-slate-900 text-slate-350' : 'bg-slate-50 border-slate-150 text-slate-700'
                        }`}>
                          {/* 1. Objective */}
                          <div className="space-y-1">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">🎯 Step Objective</span>
                            <p className="text-slate-300 font-semibold">{step.objective}</p>
                          </div>

                          {/* 2. Architecture */}
                          <div className="space-y-1 border-t border-slate-900/40 pt-2">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">🏗️ Architecture Design</span>
                            <p className="text-slate-400">{step.architecture}</p>
                          </div>

                          {/* 3. Database Tables */}
                          {step.databaseTables?.length > 0 && (
                            <div className="space-y-1 border-t border-slate-900/40 pt-2">
                              <span className="font-extrabold uppercase text-[9px] text-indigo-400 block mb-1">📊 Database Tables Used</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {step.databaseTables.map((t, idx) => (
                                  <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-emerald-400 font-mono text-[9px]">{t}</code>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 4. Construction Process */}
                          <div className="space-y-1 border-t border-slate-900/40 pt-2">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">🛠️ Step-by-Step Construction</span>
                            <p className="text-slate-400 whitespace-pre-wrap leading-normal">{step.constructionProcess}</p>
                          </div>

                          {/* 5. Internal Working */}
                          <div className="space-y-1 border-t border-slate-900/40 pt-2">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">🔄 Internal Working Flow</span>
                            <p className="text-slate-400">{step.internalWorking}</p>
                          </div>

                          {/* 6. Folder Structure & Files to Create */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900/40 pt-2">
                            <div>
                              <span className="font-extrabold uppercase text-[9px] text-indigo-400 block mb-1">📂 Workspace Layout</span>
                              <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-300 font-mono text-[9px] overflow-x-auto whitespace-pre leading-normal">
                                <code>{step.folderStructure}</code>
                              </pre>
                            </div>
                            <div>
                              <span className="font-extrabold uppercase text-[9px] text-indigo-400 block mb-1.5">📄 Files to Create / Edit</span>
                              <div className="flex flex-col gap-1.5">
                                {step.filesToCreate.map((f, idx) => (
                                  <div key={idx} className="flex items-center space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <code className="text-indigo-400 font-mono text-[9px]">{f}</code>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 7. Code Explanation */}
                          <div className="space-y-1 border-t border-slate-900/40 pt-2">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">💻 Code Modules Explanation</span>
                            <p className="text-slate-400 leading-normal">{step.codeExplanation}</p>
                          </div>

                          {/* 8. APIs Required */}
                          {step.apisRequired?.length > 0 && (
                            <div className="space-y-1 border-t border-slate-900/40 pt-2">
                              <span className="font-extrabold uppercase text-[9px] text-indigo-400 block mb-1.5">🔗 Required APIs</span>
                              <div className="space-y-1.5">
                                {step.apisRequired.map((api, idx) => (
                                  <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-850 flex items-center justify-between text-[8px]">
                                    <code className="text-indigo-400 font-mono font-bold">{api.route}</code>
                                    <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400 font-extrabold">{api.method}</span>
                                    <span className="text-slate-400 text-right">{api.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 9. Backend & Frontend Integrations */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900/40 pt-2">
                            <div>
                              <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">⚙️ Backend Integration</span>
                              <p className="text-slate-400 mt-1 leading-normal">{step.backendIntegration}</p>
                            </div>
                            <div>
                              <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">🌐 Frontend Integration</span>
                              <p className="text-slate-400 mt-1 leading-normal">{step.frontendIntegration}</p>
                            </div>
                          </div>

                          {/* 10. Testing Procedure */}
                          <div className="space-y-1 border-t border-slate-900/40 pt-2">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block mb-1">🧪 Verification Testing Command</span>
                            <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 text-indigo-400 font-mono text-[9px] overflow-x-auto">
                              <code>{step.testingProcedure}</code>
                            </pre>
                          </div>

                          {/* 11. Common Errors */}
                          <div className="space-y-1 border-t border-slate-900/40 pt-2">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">⚠️ Common Errors & Troubleshooting</span>
                            <p className="text-rose-450 whitespace-pre-wrap leading-normal">{step.commonErrors}</p>
                          </div>

                          {/* 12. Interview Questions */}
                          <div className="space-y-1 border-t border-slate-900/40 pt-2">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block mb-1.5">🎓 Academic Interview Preparation (Viva)</span>
                            <div className="space-y-2.5">
                              {step.interviewQuestions.map((q, idx) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5">
                                  <span className="font-bold text-slate-300 text-[9px] block">• {q.split('\n')[0]}</span>
                                  {q.split('\n')[1] && (
                                    <span className="text-slate-400 text-[9px] block pl-3 leading-normal">{q.split('\n')[1]}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 13. Real-World Usage */}
                          <div className="space-y-1 border-t border-slate-900/40 pt-2">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 block">💼 Real-World Industry Application</span>
                            <p className="text-slate-400 leading-normal">{step.realWorldUsage}</p>
                          </div>

                          {/* AI Discussion Doubts Panel */}
                          <div className="pt-3 border-t border-slate-900/20 space-y-3">
                            <span className="font-extrabold uppercase text-[9px] text-indigo-400 flex items-center space-x-1">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                              <span>AI Doubts Chat Panel</span>
                            </span>

                            {/* Chat history */}
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {(stepChats[step.step] || []).length === 0 ? (
                                <p className="text-[9px] text-slate-500 text-center italic">Ask any doubts about this step...</p>
                              ) : (
                                (stepChats[step.step] || []).map((msg, mIdx) => (
                                  <div key={mIdx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[8px] text-slate-500 font-bold mb-0.5">{msg.sender === 'user' ? 'You' : 'AI Mentor'}</span>
                                    <div className={`p-2 rounded-xl max-w-[90%] leading-relaxed ${
                                      msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                                    }`}>
                                      {msg.sender === 'user' ? msg.text : renderMarkdown(msg.text)}
                                    </div>
                                  </div>
                                ))
                              )}
                              {isStepChatTyping[step.step] && (
                                <div className="flex items-center space-x-1 text-slate-500 pl-1.5">
                                  <span className="inline-block w-1 h-1 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="inline-block w-1 h-1 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="inline-block w-1 h-1 bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              )}
                            </div>

                            {/* Input form */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSendStepChat(step.step, step.title);
                              }}
                              className="flex items-center space-x-2 pt-2 border-t border-slate-800/10"
                            >
                              <input
                                type="text"
                                value={stepChatInputs[step.step] || ''}
                                onChange={(e) => setStepChatInputs(prev => ({ ...prev, [step.step]: e.target.value }))}
                                placeholder="Ask step doubts..."
                                className={`flex-grow px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold outline-none ${
                                  theme === 'dark'
                                    ? 'border-slate-850 bg-slate-900/35 text-slate-200 focus:border-indigo-500'
                                    : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                                }`}
                              />
                              <button
                                type="submit"
                                disabled={!(stepChatInputs[step.step] || '').trim() || isStepChatTyping[step.step]}
                                className="p-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prompt to start building if not active */}
            {!isBuilding && (
              <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-center text-xs text-indigo-400">
                <Sparkles className="w-5 h-5 mx-auto mb-2 animate-pulse" />
                <p className="font-semibold mb-3">Enable progress tracking & unlock AI Mentor Chat panels</p>
                <button
                  onClick={handleStartBuilding}
                  className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all text-xxs cursor-pointer"
                >
                  Start Project Build
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Mentor panel */}
      {isBuilding && (
        <MentorChat
          project={project}
          theme={theme}
          progressPercent={progressPercent}
          completedSteps={completedSteps}
        />
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
        <div key={i} className="my-3 rounded-xl border border-slate-850 bg-slate-950 overflow-hidden font-mono text-[9px] w-full text-left">
          <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-slate-850 text-[8px] font-bold text-slate-400">
            <span>{lang || 'code'}</span>
            <button 
              type="button"
              onClick={() => navigator.clipboard.writeText(code)}
              className="hover:text-indigo-400 font-semibold cursor-pointer"
            >
              Copy
            </button>
          </div>
          <pre className="p-2.5 overflow-x-auto text-slate-350 leading-relaxed font-mono">
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
            return <code key={j} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850 text-indigo-400 font-mono text-[9px]">{sub.slice(1, -1)}</code>;
          }
          return sub;
        })}
      </span>
    );
  });
}
