import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StarryBackground from './components/StarryBackground';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import Recommendations from './pages/Recommendations';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import About from './pages/About';
import { projectsDatabase } from './data/projectsDatabase';
import { adaptProject } from './utils/projectAdapter';
import { api, getToken, setToken, removeToken } from './utils/api';

interface UserProfile {
  branch: string;
  specialization: string;
  languages: string[];
  skillLevel: string;
  academicYear: string;
}

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('forge_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // User Authentication State
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('forge_user');
    return saved ? JSON.parse(saved) : null;
  });

  // User Profile State
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('forge_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Routing State
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Apply Theme Class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('forge_theme', theme);
  }, [theme]);

  // Sync Database Session on startup or login
  useEffect(() => {
    const token = getToken();
    if (token && user) {
      // Fetch latest profile and activities from PostgreSQL database
      Promise.all([api.profile.get(), api.activity.get()])
        .then(([profData, actData]) => {
          const mappedProfile = {
            branch: profData.branch,
            specialization: profData.specialization,
            languages: profData.languages,
            skillLevel: profData.skill_level,
            academicYear: profData.academic_year
          };
          setProfile(mappedProfile);
          localStorage.setItem('forge_profile', JSON.stringify(mappedProfile));

          // Sync local storage activity cache for fast offline updates
          localStorage.setItem('forge_user_activity', JSON.stringify({
            saved: actData.saved,
            favorites: actData.favorites,
            completed: actData.completed,
            viewed: [], // maintain locally
            history: actData.history,
            progress: actData.progress
          }));
        })
        .catch((err) => {
          console.warn("PostgreSQL session sync skipped on startup:", err.message);
          // If token expired, clear session
          if (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('invalid')) {
            handleLogout();
          }
        });
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogin = (name: string, email: string, token: string) => {
    const newUser = { name, email };
    setToken(token);
    setUser(newUser);
    localStorage.setItem('forge_user', JSON.stringify(newUser));
    
    // Check profile database record to decide route
    api.profile.get()
      .then((profData) => {
        const mappedProfile = {
          branch: profData.branch,
          specialization: profData.specialization,
          languages: profData.languages,
          skillLevel: profData.skill_level,
          academicYear: profData.academic_year
        };
        setProfile(mappedProfile);
        localStorage.setItem('forge_profile', JSON.stringify(mappedProfile));
        setCurrentPage('dashboard');
      })
      .catch(() => {
        setProfile(null);
        localStorage.removeItem('forge_profile');
        setCurrentPage('profile-setup');
      });
  };

  const handleSignup = (name: string, email: string, token: string) => {
    const newUser = { name, email };
    setToken(token);
    setUser(newUser);
    localStorage.setItem('forge_user', JSON.stringify(newUser));
    
    setProfile(null);
    localStorage.removeItem('forge_profile');
    setCurrentPage('profile-setup');
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setSelectedProjectId(null);
    removeToken();
    localStorage.removeItem('forge_user');
    localStorage.removeItem('forge_profile');
    localStorage.removeItem('forge_user_activity');
    setCurrentPage('landing');
  };

  const handleSaveProfile = (profileData: UserProfile) => {
    api.profile.save(profileData)
      .then(() => {
        setProfile(profileData);
        localStorage.setItem('forge_profile', JSON.stringify(profileData));
        setCurrentPage('recommendations');
      })
      .catch((err) => {
        console.error("Failed to save profile in database:", err.message);
        // Fallback: save locally anyway to let them continue
        setProfile(profileData);
        localStorage.setItem('forge_profile', JSON.stringify(profileData));
        setCurrentPage('recommendations');
      });
  };

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Dynamic star field background */}
      <StarryBackground theme={theme} />

      {/* Navigation Header */}
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user}
        logout={handleLogout}
        hasProfile={!!profile}
      />

      {/* Main Page Content */}
      <main className="flex-grow relative z-10">
        {currentPage === 'landing' && (
          <Landing 
            theme={theme} 
            setCurrentPage={setCurrentPage} 
            user={user} 
            hasProfile={!!profile} 
          />
        )}

        {currentPage === 'login' && (
          <Login 
            theme={theme} 
            setCurrentPage={setCurrentPage} 
            login={handleLogin} 
          />
        )}

        {currentPage === 'signup' && (
          <Signup 
            theme={theme} 
            setCurrentPage={setCurrentPage} 
            login={handleSignup} 
          />
        )}

        {currentPage === 'profile-setup' && (
          <ProfileSetup 
            theme={theme} 
            saveProfile={handleSaveProfile} 
          />
        )}

        {currentPage === 'contact' && (
          <Contact theme={theme} />
        )}

        {currentPage === 'about' && (
          <About theme={theme} />
        )}

        {currentPage === 'feedback' && (
          <Feedback theme={theme} />
        )}

        {currentPage === 'recommendations' && profile && (
          <Recommendations 
            theme={theme} 
            setCurrentPage={setCurrentPage} 
            setSelectedProjectId={setSelectedProjectId} 
            profile={profile} 
          />
        )}

        {currentPage === 'dashboard' && (
          <Dashboard 
            theme={theme} 
            setCurrentPage={setCurrentPage} 
            setSelectedProjectId={setSelectedProjectId} 
            profile={profile} 
          />
        )}

        {currentPage === 'project-detail' && selectedProjectId && (
          (() => {
            const baseProj = projectsDatabase.find(p => p.id === selectedProjectId);
            const activeProfile = profile || {
              branch: 'Computer Science Engineering (CSE)',
              specialization: 'Artificial Intelligence',
              languages: ['Python', 'C++'],
              skillLevel: 'Intermediate',
              academicYear: '3rd Year'
            };
            if (!baseProj) return <div className="text-center py-12">Project blueprint not found.</div>;
            const adapted = adaptProject(baseProj, activeProfile);
            return (
              <ProjectDetail 
                project={adapted} 
                theme={theme} 
                setCurrentPage={setCurrentPage} 
              />
            );
          })()
        )}
      </main>

      {/* Footer Branding */}
      <Footer theme={theme} setCurrentPage={setCurrentPage} />
    </div>
  );
}
