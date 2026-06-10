import React, { useState } from 'react';
import { Sparkles, Sliders, Code2, GraduationCap, ChevronLeft, ChevronRight, Check, Search, X, Mail } from 'lucide-react';

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

interface ProfileSetupProps {
  theme: 'dark' | 'light';
  saveProfile: (profileData: {
    branch: string;
    specialization: string;
    languages: string[];
    skillLevel: string;
    academicYear: string;
    github?: string;
    linkedin?: string;
    primaryEmail?: string;
    secondaryEmail?: string;
  }) => void;
}

export default function ProfileSetup({ theme, saveProfile }: ProfileSetupProps) {
  const [step, setStep] = useState(1);

  // Form Fields
  const [branch, setBranch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [github, setGithub] = useState('https://github.com/abhishek37-datascience');
  const [linkedin, setLinkedin] = useState('https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1');
  const [primaryEmail, setPrimaryEmail] = useState('kavalaabhishek37@gmail.com');
  const [secondaryEmail, setSecondaryEmail] = useState('kavalasivaramasaiabhishek37@gmail.com');

  // Search filter for languages
  const [langSearch, setLangSearch] = useState('');

  // 25 Branches
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

  // 17 Specializations
  const specializations = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'Internet of Things',
    'VLSI Design',
    'Embedded Systems',
    'Robotics',
    'Renewable Energy',
    'Computer Vision',
    'Natural Language Processing',
    'Deep Learning',
    'Big Data Engineering',
    'Control Systems',
    'Mechatronics',
    'None'
  ];

  // 30 Languages
  const languages = [
    'C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'C#', 'Go', 'Rust',
    'Swift', 'Kotlin', 'Dart', 'PHP', 'Ruby', 'R', 'MATLAB', 'Julia', 'Scala',
    'Perl', 'Objective-C', 'SQL', 'Bash', 'Assembly Language', 'Fortran', 'COBOL',
    'Lua', 'Haskell', 'Elixir', 'F#', 'Prolog'
  ];

  const handleLanguageToggle = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!branch) setBranch('Computer Science Engineering (CSE)');
      if (!academicYear) setAcademicYear('1st Year');
    }
    if (step === 2) {
      if (!specialization) setSpecialization('None');
      if (!skillLevel) setSkillLevel('Beginner');
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLanguages = selectedLanguages.length > 0 ? selectedLanguages : ['Python', 'JavaScript'];
    const finalBranch = branch || 'Computer Science Engineering (CSE)';
    const finalSpecialization = specialization || 'None';
    const finalSkillLevel = skillLevel || 'Beginner';
    const finalAcademicYear = academicYear || '1st Year';

    saveProfile({
      branch: finalBranch,
      specialization: finalSpecialization,
      languages: finalLanguages,
      skillLevel: finalSkillLevel,
      academicYear: finalAcademicYear,
      github: github || 'https://github.com/abhishek37-datascience',
      linkedin: linkedin || 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1',
      primaryEmail: primaryEmail || 'kavalaabhishek37@gmail.com',
      secondaryEmail: secondaryEmail || 'kavalasivaramasaiabhishek37@gmail.com'
    });
  };

  const filteredLanguages = languages.filter(lang =>
    lang.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-grid-pattern opacity-50' : 'bg-grid-pattern-light opacity-50'}`} />

      <div className={`w-full max-w-2xl rounded-2xl border transition-all relative z-10 p-8 ${
        theme === 'dark' ? 'glass-dark border-slate-800/80 shadow-2xl' : 'glass-light border-slate-200/80 shadow-xl'
      }`}>
        {/* Glow Accent */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Setup Your Academic Profile
          </h2>
          <p className={`text-sm mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Let's configure your profile to recommendations matching your interests.
          </p>

          {/* Progress Bar */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    step >= s
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white'
                      : theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/50 text-slate-500'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-0.5 w-16 transition-all ${
                      step > s ? 'bg-indigo-500' : theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Forms */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Branch & Year */}
          {step === 1 && (
            <div className="space-y-6 animate-float-delayed">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <GraduationCap className="w-4 h-4 mr-1.5 text-indigo-400" />
                  Select Engineering Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                      : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                  }`}
                >
                  <option value="" disabled>Choose your branch...</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Sliders className="w-4 h-4 mr-1.5 text-indigo-400" />
                  Academic Year of Study
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                    <button
                      type="button"
                      key={year}
                      onClick={() => setAcademicYear(year)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        academicYear === year
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : theme === 'dark'
                          ? 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 shadow-sm'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Specialization & Skill Level */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Sparkles className="w-4 h-4 mr-1.5 text-indigo-400" />
                  Domain Specialization
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                      : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                  }`}
                >
                  <option value="" disabled>Select specialization...</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Sliders className="w-4 h-4 mr-1.5 text-indigo-400" />
                  Your Skill Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSkillLevel(lvl)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        skillLevel === lvl
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : theme === 'dark'
                          ? 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 shadow-sm'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Programming Languages Selector */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Code2 className="w-4 h-4 mr-1.5 text-indigo-400" />
                  Programming Languages Known
                </label>
                <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Select all languages you know or want to build in.
                </p>

                {/* Selected Languages Tags */}
                {selectedLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                    {selectedLanguages.map(lang => (
                      <span
                        key={lang}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500 text-white shadow-sm"
                      >
                        <span>{lang}</span>
                        <button type="button" onClick={() => handleLanguageToggle(lang)}>
                          <X className="w-3.5 h-3.5 hover:text-red-200" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-3.5">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder="Search programming languages..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* Scrollable Language Grid */}
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-2 border rounded-xl ${
                  theme === 'dark' ? 'border-slate-850 bg-slate-900/20' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  {filteredLanguages.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => handleLanguageToggle(lang)}
                        className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : theme === 'dark'
                            ? 'border-slate-800/80 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{lang}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })}
                  {filteredLanguages.length === 0 && (
                    <div className="col-span-full py-6 text-center text-xs text-slate-500">
                      No matching languages found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Social Links & Contacts */}
          {step === 4 && (
            <div className="space-y-4 animate-float-delayed">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <GithubIcon className="w-4 h-4 mr-1.5 text-indigo-400" />
                  GitHub Profile Link
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/40 text-slate-205 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                      : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <LinkedinIcon className="w-4 h-4 mr-1.5 text-indigo-400" />
                  LinkedIn Profile Link
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://www.linkedin.com/in/yourusername"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/40 text-slate-205 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                      : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <Mail className="w-4 h-4 mr-1.5 text-indigo-400" />
                    Primary Email
                  </label>
                  <input
                    type="email"
                    value={primaryEmail}
                    onChange={(e) => setPrimaryEmail(e.target.value)}
                    placeholder="kavala@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/40 text-slate-205 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <Mail className="w-4 h-4 mr-1.5 text-indigo-400" />
                    Secondary Email
                  </label>
                  <input
                    type="email"
                    value={secondaryEmail}
                    onChange={(e) => setSecondaryEmail(e.target.value)}
                    placeholder="kavalasivaramasaiabhishek37@gmail.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/40 text-slate-205 text-slate-200 focus:border-indigo-500 focus:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buttons Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-900/20">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className={`px-5 py-2.5 rounded-xl border text-sm font-semibold flex items-center space-x-1.5 transition-all ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-900'
                    : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-md`}
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-md`}
              >
                <span>Complete Profile</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
