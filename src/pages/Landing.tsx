import { ArrowRight, Cpu, BookOpen, Sliders, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

interface LandingProps {
  theme: 'dark' | 'light';
  setCurrentPage: (page: string) => void;
  user: { name: string; email: string } | null;
  hasProfile: boolean;
}

export default function Landing({ theme, setCurrentPage, user, hasProfile }: LandingProps) {
  const features = [
    {
      icon: Sliders,
      title: 'Smart Recommendation Filter',
      desc: 'Matches projects using your branch, specialization, programming skills, skill level, and academic year.'
    },
    {
      icon: BookOpen,
      title: '23-Element Blueprints',
      desc: 'Every project comes with database design, folder tree, code structures, viva prep questions, and COST summaries.'
    },
    {
      icon: MessageSquare,
      title: 'AI Interactive Mentorship',
      desc: 'Floating progress tracking combined with a contextual AI chat assistant that answers queries step-by-step.'
    },
    {
      icon: Cpu,
      title: 'Multidisciplinary Engineering',
      desc: 'Tailored roadmaps for 25 branches, including Mechanical, Civil, ECE, Biotechnology, EEE, Mechatronics, and CSE.'
    },
    {
      icon: ShieldCheck,
      title: 'GitHub & Resume Ready',
      desc: 'Instantly download or copy pre-structured README templates and resume-ready summaries for your career portfolio.'
    },
    {
      icon: Zap,
      title: 'Fast & Saved Locally',
      desc: 'Save project steps, history, favorites, and completed stats locally in your browser. No heavy clouds needed.'
    }
  ];

  const branches = [
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Electrical & Electronics', 'Mechanical', 'Civil', 'Chemical', 'Aerospace',
    'Biotechnology', 'Biomedical', 'Mechatronics', 'Robotics', 'Cyber Security',
    'Data Science', 'AI & Machine Learning', 'Internet of Things'
  ];

  const handleCta = () => {
    if (!user) {
      setCurrentPage('signup');
    } else if (!hasProfile) {
      setCurrentPage('profile-setup');
    } else {
      setCurrentPage('recommendations');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Grids & Blobs */}
      <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-grid-pattern opacity-100' : 'bg-grid-pattern-light opacity-100'}`} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase transition-all mb-6 bg-indigo-500/5 border-indigo-500/20 text-indigo-400">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Gen ForgePilot AI 🚀 Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-tight max-w-4xl mx-auto mb-6">
          Forge Engineering Ideas into{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-glow">
            Production-Ready
          </span>{' '}
          Masterpieces
        </h1>

        <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Personalized engineering project recommendations, complete architectural roadmaps, code trees, database schemas, and AI interactive mentoring tailored for your branch.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleCta}
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Start Building Projects</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setCurrentPage('contact')}
            className={`w-full sm:w-auto px-8 py-4 text-base font-semibold border rounded-xl transition-all ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:border-slate-700'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            Contact Developer
          </button>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-2xl border transition-all ${
          theme === 'dark' ? 'glass-dark border-slate-800/80' : 'glass-light border-slate-200/80'
        }`}>
          {[
            { value: '25+', label: 'Branches Supported' },
            { value: '50+', label: 'Detailed Blueprints' },
            { value: '23', label: 'Analysis Features' },
            { value: '100%', label: 'Local Storage Encrypted' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-indigo-400 mb-1">
                {stat.value}
              </div>
              <div className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold font-heading tracking-tight mb-4">
            Everything You Need to Build & Succeed
          </h2>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            Skip the generic search. Get precise documentation and contextual mentorship customized to your programming skill levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className={`p-6 rounded-2xl border transition-all transform hover:-translate-y-1 hover:shadow-lg ${
                  theme === 'dark' 
                    ? 'bg-slate-925/55 border-slate-900/80 hover:border-slate-800' 
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-bold font-heading mb-2.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  {feat.title}
                </h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Branches Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 border-t border-slate-900/60">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-heading mb-2">Supported Disciplines</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Explore projects across all major undergraduate degrees
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
          {branches.map((b, i) => (
            <span
              key={i}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border tracking-wide transition-all hover:scale-105 cursor-default ${
                theme === 'dark'
                  ? 'border-slate-900 bg-slate-900/40 text-slate-400 hover:text-indigo-400 hover:border-slate-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:border-slate-300'
              }`}
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className={`relative p-8 sm:p-12 rounded-3xl overflow-hidden border text-center ${
          theme === 'dark' 
            ? 'glass-dark border-indigo-500/15' 
            : 'glass-light border-indigo-500/15 bg-gradient-to-br from-indigo-50/30 to-purple-50/30'
        }`}>
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight mb-4">
            Ready to Forge Your Project?
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Sign up now to configure your academic profile, view 50 personalized project blueprints, and start building with your interactive AI Mentor.
          </p>
          <button
            onClick={handleCta}
            className="px-8 py-3.5 text-base font-bold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
