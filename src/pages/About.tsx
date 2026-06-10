import { Code2, GraduationCap, Globe, Terminal } from 'lucide-react';

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

interface AboutProps {
  theme: 'dark' | 'light';
}

export default function About({ theme }: AboutProps) {
  const devDetails = {
    name: 'Abhishek Kavala',
    role: 'Full Stack & Data Science Engineer',
    primaryEmail: 'kavalaabhishek37@gmail.com',
    secondaryEmail: 'kavalasivaramasaiabhishek37@gmail.com',
    github: 'https://github.com/abhishek37-datascience',
    linkedin: 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1'
  };

  const skills = ['React / TypeScript', 'Node.js / Express', 'PostgreSQL / SQL', 'Python / Data Science', 'Generative AI API Integration', 'Docker & Devops'];

  return (
    <div className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Background elements */}
      <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-grid-pattern opacity-40' : 'bg-grid-pattern-light opacity-40'}`} />
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Page Header */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight mb-3">
          About the Developer
        </h1>
        <p className={`text-sm max-w-xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-655'}`}>
          Meet the engineer behind ForgePilot AI 🚀 and learn more about the project's vision and technical stack.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        {/* Left column: Portfolio Bio Card */}
        <div className={`md:col-span-5 p-6 rounded-2xl border flex flex-col items-center text-center ${
          theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-2xl' : 'glass-light border-slate-200/80 shadow-xl'
        }`}>
          {/* Developer Avatar placeholder / symbol */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mb-4">
            AK
          </div>
          <h2 className="text-xl font-bold font-heading">{devDetails.name}</h2>
          <p className="text-xs font-semibold text-indigo-400 mt-1">{devDetails.role}</p>

          <div className="w-full border-t border-slate-800/40 my-5 pt-4 text-left space-y-3.5 text-xs">
            <h3 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider mb-2">
              Connect With Developer
            </h3>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Primary Email</span>
              <a href={`mailto:${devDetails.primaryEmail}`} className="font-semibold text-slate-300 hover:text-indigo-400 transition-colors">
                {devDetails.primaryEmail}
              </a>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Secondary Email</span>
              <a href={`mailto:${devDetails.secondaryEmail}`} className="font-semibold text-slate-300 hover:text-indigo-400 transition-colors">
                {devDetails.secondaryEmail}
              </a>
            </div>
          </div>

          {/* Social Links buttons */}
          <div className="mt-auto pt-6 border-t border-slate-800/40 w-full flex items-center justify-center space-x-3">
            <a 
              href={devDetails.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all"
              title="GitHub Profile"
            >
              <GithubIcon className="w-4.5 h-4.5" />
              <span>GitHub</span>
            </a>
            <a 
              href={devDetails.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all"
              title="LinkedIn Profile"
            >
              <LinkedinIcon className="w-4.5 h-4.5" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Right column: Platform vision & Skills */}
        <div className="md:col-span-7 space-y-6">
          {/* Vision card */}
          <div className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-md' : 'glass-light border-slate-200/80 shadow-sm'
          }`}>
            <h3 className="text-base font-bold font-heading mb-3 flex items-center text-indigo-400">
              <Globe className="w-5 h-5 mr-2 text-indigo-400" />
              <span>ForgePilot AI 🚀 Project Vision</span>
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-655'}`}>
              ForgePilot AI 🚀 is designed to solve a major pain point in engineering education: the gap between academic theory and practical build processes. By automatically adapting project difficulty, tech stacks, and step-by-step guides to the student's background, the platform acts as an automated guide that drives projects to production.
            </p>
          </div>

          {/* Technology stack card */}
          <div className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-md' : 'glass-light border-slate-200/80 shadow-sm'
          }`}>
            <h3 className="text-base font-bold font-heading mb-4 flex items-center text-indigo-400">
              <Code2 className="w-5 h-5 mr-2 text-indigo-400" />
              <span>Developer Skills & Tech Stack</span>
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-5">
              {skills.map((skill, idx) => (
                <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                  {skill}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-850">
                <GraduationCap className="w-5 h-5 text-purple-400 mb-1.5" />
                <span className="font-bold block text-slate-300">Engineering Student</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Focusing on Full-Stack, IoT, and AI systems.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-850">
                <Terminal className="w-5 h-5 text-emerald-400 mb-1.5" />
                <span className="font-bold block text-slate-300">Data Science Enthusiast</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Implementing LLM workflows and statistics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
