import React, { useState } from 'react';
import { Sparkles, Sliders, Code2, GraduationCap, ChevronLeft, ChevronRight, Check, Search, X } from 'lucide-react';

interface ProfileSetupProps {
  theme: 'dark' | 'light';
  saveProfile: (profileData: {
    branch: string;
    specialization: string;
    languages: string[];
    skillLevel: string;
    academicYear: string;
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
      academicYear: finalAcademicYear
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
            {[1, 2, 3].map((s) => (
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
                {s < 3 && (
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

            {step < 3 ? (
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
