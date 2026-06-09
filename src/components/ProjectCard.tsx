import { Bookmark, Heart, Clock, DollarSign, ArrowRight } from 'lucide-react';
import type { AdaptedProject } from '../utils/projectAdapter';

interface ProjectCardProps {
  project: AdaptedProject;
  theme: 'dark' | 'light';
  isSaved: boolean;
  isFavorite: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onViewDetails: () => void;
}

export default function ProjectCard({
  project,
  theme,
  isSaved,
  isFavorite,
  onToggleSave,
  onToggleFavorite,
  onViewDetails
}: ProjectCardProps) {
  // Determine difficulty level color
  const diffColors = {
    Beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
    Intermediate: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    Advanced: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
  }[project.difficultyLevel];

  return (
    <div
      onClick={onViewDetails}
      className={`group relative rounded-2xl border p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
        theme === 'dark'
          ? 'bg-slate-925/55 border-slate-900 hover:border-slate-800'
          : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
      }`}
    >
      {/* Dynamic Glow Overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Title & Interaction Icons */}
      <div className="flex items-start justify-between mb-3.5 relative z-10">
        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border tracking-wider uppercase ${diffColors}`}>
          {project.difficultyLevel}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className={`p-2 rounded-lg border transition-all ${
              isFavorite
                ? 'border-red-500/20 bg-red-500/10 text-red-500'
                : theme === 'dark'
                ? 'border-slate-800 hover:border-slate-700 text-slate-500 hover:text-red-400'
                : 'border-slate-200 text-slate-400 hover:text-red-500'
            }`}
            title="Mark as Favorite"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(e);
            }}
            className={`p-2 rounded-lg border transition-all ${
              isSaved
                ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                : theme === 'dark'
                ? 'border-slate-800 hover:border-slate-700 text-slate-500 hover:text-indigo-400'
                : 'border-slate-200 text-slate-400 hover:text-indigo-500'
            }`}
            title="Save Project"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Project Metadata info */}
      <div className="relative z-10">
        <h3 className={`text-lg font-bold font-heading mb-2 leading-snug group-hover:text-indigo-400 transition-colors ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-850'
        }`}>
          {project.name}
        </h3>
        
        {/* Branch / Spec tag */}
        <p className="text-xs text-slate-500 font-semibold mb-3">
          {project.branch.replace(' Engineering', '')} {project.specialization !== 'None' && `• ${project.specialization}`}
        </p>

        <p className={`text-sm leading-relaxed line-clamp-2 mb-4.5 ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {project.problemStatement}
        </p>

        {/* Technical Chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.languages.map((lang) => (
            <span
              key={lang}
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                project.primaryLanguage === lang
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : theme === 'dark'
                  ? 'bg-slate-900 text-slate-400'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Cost & Completion Metadata footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-900/10 text-xs font-semibold text-slate-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{project.estimatedCompletionTime}</span>
          </div>
          <div className="flex items-center space-x-0.5">
            <DollarSign className="w-3.5 h-3.5 text-green-400" />
            <span>{project.costEstimation === 0 ? 'Free' : `$${project.costEstimation}`}</span>
          </div>
        </div>

        {/* View Details arrow indicator */}
        <div className="mt-4 flex items-center justify-end text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="mr-1">View Blueprint</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
