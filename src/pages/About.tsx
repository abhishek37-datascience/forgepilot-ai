import { Github, Linkedin, Mail, Code2, GraduationCap, Globe, Terminal } from 'lucide-react';

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
              <Github className="w-4.5 h-4.5" />
              <span>GitHub</span>
            </a>
            <a 
              href={devDetails.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4.5 h-4.5" />
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
