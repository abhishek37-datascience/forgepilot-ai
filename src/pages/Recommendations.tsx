import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Sliders, RefreshCw, Sparkles, X } from 'lucide-react';
import { generateRecommendations } from '../utils/matchingEngine';
import type { AdaptedProject } from '../utils/projectAdapter';
import ProjectCard from '../components/ProjectCard';
import { 
  getActivity, 
  logProjectView,
  saveSearchQuery
} from '../utils/localStorageHelper';

import { api } from '../utils/api';

interface RecommendationsProps {
  theme: 'dark' | 'light';
  setCurrentPage: (page: string) => void;
  setSelectedProjectId: (id: string) => void;
  profile: {
    branch: string;
    specialization: string;
    languages: string[];
    skillLevel: string;
    academicYear: string;
  };
}

export default function Recommendations({
  theme,
  setCurrentPage,
  setSelectedProjectId,
  profile
}: RecommendationsProps) {
  const [allRecommendations, setAllRecommendations] = useState<AdaptedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<AdaptedProject[]>([]);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selBranch, setSelBranch] = useState('');
  const [selSpecialization, setSelSpecialization] = useState('');
  const [selLanguage, setSelLanguage] = useState('');
  const [selSkill, setSelSkill] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Local Storage Activity sync
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // 25 Branches, 17 Specializations, 30 Languages
  const branches = [
    'Computer Science Engineering (CSE)',
    'Information Technology (IT)',
    'Electronics and Communication Engineering (ECE)',
    'Electrical and Electronics Engineering (EEE)',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biotechnology Engineering',
    'Biomedical Engineering',
    'Agricultural Engineering',
    'Petroleum Engineering',
    'Mining Engineering',
    'Metallurgical Engineering',
    'Marine Engineering',
    'Mechatronics Engineering',
    'Robotics Engineering',
    'Environmental Engineering',
    'Food Technology',
    'Materials Science Engineering',
    'Artificial Intelligence and Data Science (AI&DS)',
    'Artificial Intelligence and Machine Learning (AI&ML)',
    'Cyber Security Engineering',
    'Data Science Engineering',
    'Internet of Things (IoT)'
  ];

  const specializations = [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Cyber Security',
    'Cloud Computing', 'Internet of Things', 'VLSI Design', 'Embedded Systems',
    'Robotics', 'Renewable Energy', 'Computer Vision', 'Natural Language Processing',
    'Deep Learning', 'Big Data Engineering', 'Control Systems', 'Mechatronics', 'None'
  ];

  const languages = [
    'C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'C#', 'Go', 'Rust',
    'Swift', 'Kotlin', 'Dart', 'PHP', 'Ruby', 'R', 'MATLAB', 'Julia', 'Scala',
    'Perl', 'Objective-C', 'SQL', 'Bash', 'Assembly Language', 'Fortran', 'COBOL',
    'Lua', 'Haskell', 'Elixir', 'F#', 'Prolog'
  ];

  // Load recommendations and activity stats
  useEffect(() => {
    const recs = generateRecommendations(profile);
    setAllRecommendations(recs);
    setFilteredProjects(recs);

    const act = getActivity();
    setSavedIds(act.saved);
    setFavoriteIds(act.favorites);
  }, [profile]);

  // Apply filters on query or dropdown updates
  useEffect(() => {
    let temp = [...allRecommendations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      temp = temp.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.problemStatement.toLowerCase().includes(q) || 
        p.objective.toLowerCase().includes(q)
      );
    }

    if (selBranch) {
      temp = temp.filter(p => p.branch === selBranch);
    }

    if (selSpecialization) {
      temp = temp.filter(p => p.specialization === selSpecialization);
    }

    if (selLanguage) {
      temp = temp.filter(p => p.languages.includes(selLanguage));
    }

    if (selSkill) {
      temp = temp.filter(p => p.difficultyLevel === selSkill);
    }

    setFilteredProjects(temp);
  }, [searchQuery, selBranch, selSpecialization, selLanguage, selSkill, allRecommendations]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearchQuery(searchQuery);
      api.activity.logSearch(searchQuery).catch(err => console.error("Search API logging failed:", err));
    }
  };

  const handleToggleSave = (id: string) => {
    api.activity.toggleSave(id)
      .then((data) => {
        const act = getActivity();
        act.saved = data.isSaved ? [...act.saved, id] : act.saved.filter(x => x !== id);
        localStorage.setItem('forge_user_activity', JSON.stringify(act));
        setSavedIds(act.saved);
      })
      .catch(err => console.error("Save API toggle failed:", err));
  };

  const handleToggleFavorite = (id: string) => {
    api.activity.toggleFavorite(id)
      .then((data) => {
        const act = getActivity();
        act.favorites = data.isFavorite ? [...act.favorites, id] : act.favorites.filter(x => x !== id);
        localStorage.setItem('forge_user_activity', JSON.stringify(act));
        setFavoriteIds(act.favorites);
      })
      .catch(err => console.error("Favorite API toggle failed:", err));
  };

  const handleViewDetails = (id: string) => {
    logProjectView(id);
    api.activity.logView(id).catch(err => console.error("View API logging failed:", err));
    setSelectedProjectId(id);
    setCurrentPage('project-detail');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelBranch('');
    setSelSpecialization('');
    setSelLanguage('');
    setSelSkill('');
  };

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background blobs */}
      <div className="absolute top-0 right-10 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900/10 pb-6 mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profile-Matched Blueprints</span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading">Personalized Recommendations</h1>
          <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-655'}`}>
            Explore 50 tailored engineering projects ranked for your profile: <span className="font-bold text-indigo-400">{profile.branch.replace(' Engineering', '')}</span>.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('profile-setup')}
          className={`px-4 py-2 rounded-xl border text-sm font-semibold flex items-center space-x-1.5 transition-all ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Search and Quick Filters bar */}
      <div className="relative z-10 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-grow">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, templates, or technology..."
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                  : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
              }`}
            />
          </form>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              showFilters 
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                : theme === 'dark' 
                ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700' 
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
            <span>Filter Blueprints</span>
          </button>
        </div>

        {/* Expandable Advanced Filters Panel */}
        {showFilters && (
          <div className={`p-6 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-float-delayed ${
            theme === 'dark' ? 'bg-slate-925/40 border-slate-900' : 'bg-slate-50 border-slate-200'
          }`}>
            {/* Branch Filter */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-slate-450' : 'text-slate-600'
              }`}>
                Engineering Branch
              </label>
              <select
                value={selBranch}
                onChange={(e) => setSelBranch(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 text-slate-250 focus:border-indigo-550'
                    : 'border-slate-200 bg-white text-slate-700 focus:border-indigo-500'
                }`}
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Specialization Filter */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-slate-450' : 'text-slate-600'
              }`}>
                Domain Specialization
              </label>
              <select
                value={selSpecialization}
                onChange={(e) => setSelSpecialization(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 text-slate-250 focus:border-indigo-550'
                    : 'border-slate-200 bg-white text-slate-700 focus:border-indigo-500'
                }`}
              >
                <option value="">All Domains</option>
                {specializations.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-slate-450' : 'text-slate-600'
              }`}>
                Programming Language
              </label>
              <select
                value={selLanguage}
                onChange={(e) => setSelLanguage(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 text-slate-250 focus:border-indigo-550'
                    : 'border-slate-200 bg-white text-slate-700 focus:border-indigo-500'
                }`}
              >
                <option value="">All Languages</option>
                {languages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Skill Level Filter */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-slate-450' : 'text-slate-600'
              }`}>
                Difficulty Level
              </label>
              <select
                value={selSkill}
                onChange={(e) => setSelSkill(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/60 text-slate-250 focus:border-indigo-550'
                    : 'border-slate-200 bg-white text-slate-700 focus:border-indigo-500'
                }`}
              >
                <option value="">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Reset button inside panels */}
            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Indicators */}
      {(selBranch || selSpecialization || selLanguage || selSkill || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 relative z-10">
          <span className="text-xs text-slate-500 font-semibold">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span>Search: {searchQuery}</span>
              <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {selBranch && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span>{selBranch.replace(' Engineering', '')}</span>
              <button onClick={() => setSelBranch('')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {selSpecialization && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span>Domain: {selSpecialization}</span>
              <button onClick={() => setSelSpecialization('')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {selLanguage && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span>Language: {selLanguage}</span>
              <button onClick={() => setSelLanguage('')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {selSkill && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span>Difficulty: {selSkill}</span>
              <button onClick={() => setSelSkill('')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* Project Cards Grid */}
      <div className="relative z-10">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                theme={theme}
                isSaved={savedIds.includes(project.id)}
                isFavorite={favoriteIds.includes(project.id)}
                onToggleSave={() => handleToggleSave(project.id)}
                onToggleFavorite={() => handleToggleFavorite(project.id)}
                onViewDetails={() => handleViewDetails(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className={`p-16 rounded-2xl border text-center ${
            theme === 'dark' ? 'glass-dark border-slate-900' : 'glass-light border-slate-200'
          }`}>
            <p className={`text-base font-semibold mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
              No project blueprints match your active filter settings.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
