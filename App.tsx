
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CurriculumView from './components/CurriculumView';
import StudySession from './components/StudySession';
import LabHub from './components/LabHub';
import ProjectHub from './components/ProjectHub';
import BlogHub from './components/BlogHub';
import AiMentor from './components/AiMentor';
import AuthView from './components/AuthView';
import LandingPage from './components/LandingPage';
import Leaderboard from './components/Leaderboard';
import { UserStats, ActivityLog, UserProfile } from './types';
import { getStoredStats, getActivityHistory, resetProgress } from './services/gamificationService';
import { getCurrentUser, logoutUser } from './services/authService';
import { Rocket, LayoutDashboard, Book, Beaker, Trash2, Code, Edit3, Menu, X, ChevronRight, Activity, LogOut, Trophy, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [view, setView] = useState<'dashboard' | 'curriculum' | 'study' | 'labs' | 'projects' | 'blog' | 'leaderboard'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  
  // Universal Theme State
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    setIsDark(prev => {
        const newVal = !prev;
        localStorage.setItem('theme', newVal ? 'dark' : 'light');
        return newVal;
    });
  };

  useEffect(() => {
    // Check for active session
    const activeUser = getCurrentUser();
    if (activeUser) {
        setUser(activeUser);
        setStats(getStoredStats(activeUser.id));
        setLogs(getActivityHistory(activeUser.id));
        setShowLanding(false); // Skip landing if logged in
    }
  }, []);

  const handleLogin = (loggedInUser: UserProfile) => {
      setUser(loggedInUser);
      setStats(getStoredStats(loggedInUser.id));
      setLogs(getActivityHistory(loggedInUser.id));
      setView('dashboard');
      setShowLanding(false);
  };

  const handleLogout = () => {
      logoutUser();
      setUser(null);
      setStats(null);
      setLogs([]);
      setShowLanding(true); // Return to landing on logout
  };

  const refreshStats = () => {
    if (user) {
        setStats(getStoredStats(user.id));
        setLogs(getActivityHistory(user.id));
    }
  }

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      const initial = resetProgress();
      setStats(initial);
      setLogs([]);
      window.location.reload(); 
    }
  };

  // Render Logic
  const content = () => {
      if (!user) {
          if (showLanding) {
              return <LandingPage onStart={() => setShowLanding(false)} isDark={isDark} toggleTheme={toggleTheme} />;
          }
          return <AuthView onLogin={handleLogin} onBack={() => setShowLanding(true)} isDark={isDark} />;
      }

      if (!stats) return <div className="min-h-screen flex items-center justify-center font-mono dark:text-white text-slate-900">LOADING USER DATA...</div>;

      const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'study', icon: Book, label: 'Study' },
        { id: 'labs', icon: Beaker, label: 'Labs' },
        { id: 'projects', icon: Code, label: 'Projects' },
        { id: 'blog', icon: Edit3, label: 'Blog' },
        { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
      ];

      // Transform logs for chart data 
      const cumulativeChartData = [];
      let runningTotal = stats.xp - logs.reduce((acc, curr) => acc + curr.xpEarned, 0); 
      
      for (const log of logs.slice().reverse()) {
          runningTotal += log.xpEarned;
          cumulativeChartData.push({
              date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              xp: runningTotal
          });
      }
      if (cumulativeChartData.length === 0) {
          cumulativeChartData.push({ date: 'Start', xp: 0 }); 
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-devops-dark text-slate-900 dark:text-slate-200 font-sans pb-24 md:pb-12 relative overflow-x-hidden transition-colors duration-300">
          
          {/* Global Ambient Background - Cleaner, Banking style gradients */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-100 dark:bg-blue-900/10 rounded-full blur-[150px] opacity-60 dark:opacity-100"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-100 dark:bg-emerald-900/10 rounded-full blur-[150px] opacity-60 dark:opacity-100"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>
          </div>

          {/* Header - Solid, Reliable Navigation Bar */}
          <nav className="border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-devops-dark/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('dashboard')}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-2 rounded-xl border border-white/10 relative z-10 shadow-lg">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="font-sans font-bold text-xl dark:text-white text-slate-900 tracking-tight">DevOps<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">Quest</span></span>
                </div>
                
                {/* Desktop Nav - Pill Design */}
                <div className="hidden md:flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/5 backdrop-blur-md">
                    {navItems.map(navItem => (
                        <button 
                            key={navItem.id}
                            onClick={() => setView(navItem.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                view === navItem.id 
                                ? 'bg-white dark:bg-devops-accent text-emerald-700 dark:text-white shadow-md dark:shadow-emerald-900/20 ring-1 ring-slate-200 dark:ring-white/10' 
                                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                        >
                            <navItem.icon className={`w-4 h-4 ${view === navItem.id ? 'text-emerald-600 dark:text-white' : ''}`} />
                            {navItem.label}
                        </button>
                    ))}
                </div>

                {/* User Profile / Logout / Theme */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm font-bold dark:text-white text-slate-900">{user.username}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">{user.role}</div>
                    </div>
                    
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-transparent dark:border-white/5"
                        title="Toggle Theme"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button 
                        onClick={handleLogout} 
                        className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors border border-transparent dark:border-white/5"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden gap-2">
                  <button 
                      onClick={toggleTheme} 
                      className="p-2 text-slate-500 dark:text-gray-400"
                  >
                      {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-2"
                    aria-label="Toggle menu"
                  >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="md:hidden bg-white dark:bg-devops-dark border-b border-slate-200 dark:border-white/10 shadow-2xl absolute w-full left-0 z-50 backdrop-blur-xl">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {navItems.map(navItem => (
                    <button
                      key={navItem.id}
                      onClick={() => {
                        setView(navItem.id as any);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        view === navItem.id 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                          : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <navItem.icon className="w-5 h-5" />
                      {navItem.label}
                    </button>
                  ))}
                  <div className="border-t border-slate-200 dark:border-white/10 my-2 pt-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl">
                          <LogOut className="w-5 h-5" /> Logout ({user.username})
                      </button>
                  </div>
                </div>
              </div>
            )}
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Always show dashboard stats at top if on Dashboard view */}
                    {view === 'dashboard' && <Dashboard stats={stats} xpHistory={cumulativeChartData} />}
                    
                    <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {view === 'dashboard' && (
                            <div className="space-y-8">
                                <div className="bg-white dark:bg-devops-card rounded-3xl border border-slate-200 dark:border-white/5 p-8 relative overflow-hidden group shadow-xl transition-colors duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="p-2 bg-slate-100 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700">
                                          <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recent Transactions</h3>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {logs.length === 0 ? (
                                            <p className="text-slate-500 dark:text-gray-500 text-sm italic">No activities logged yet. Go to Study to begin!</p>
                                        ) : (
                                            logs.slice(0, 5).map((log, idx) => (
                                                <div key={log.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 group/item">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-mono text-slate-400 dark:text-gray-500 opacity-50">{String(idx + 1).padStart(2, '0')}</span>
                                                        <div>
                                                            <p className="text-sm text-slate-700 dark:text-white font-bold group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-300 transition-colors uppercase tracking-wide">{log.type.replace('_', ' ')}</p>
                                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">{log.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-100 dark:bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-400/20">+{log.xpEarned} XP</span>
                                                        <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1 font-mono">{new Date(log.timestamp).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                
                                <CurriculumView />
                            </div>
                        )}

                        {view === 'study' && <StudySession onActivityLogged={refreshStats} />}
                        {view === 'labs' && <LabHub onActivityLogged={refreshStats} />}
                        {view === 'projects' && <ProjectHub onActivityLogged={refreshStats} />}
                        {view === 'blog' && <BlogHub onActivityLogged={refreshStats} />}
                        {view === 'leaderboard' && <Leaderboard currentUser={user} />}
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Cert Progress Micro-component */}
                    <div className="bg-gradient-to-br from-yellow-50 dark:from-yellow-900/20 to-orange-50 dark:to-yellow-900/10 backdrop-blur-xl rounded-3xl border border-yellow-200 dark:border-yellow-500/20 p-6 relative overflow-hidden shadow-lg transition-colors">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/10 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
                        
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                            Certification Path
                        </h3>
                        
                        <div className="space-y-4 relative z-10">
                            <div className="group bg-white/60 dark:bg-gray-900/50 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-500/30 hover:border-yellow-400 dark:hover:border-yellow-500/50 transition-all">
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-slate-800 dark:text-white font-bold">AWS Cloud Practitioner</span>
                                    <span className="text-yellow-600 dark:text-yellow-400 font-mono text-xs bg-yellow-100 dark:bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-200 dark:border-yellow-400/20">WK 1/12</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-black/40 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-white/5">
                                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: '8%' }}></div>
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Active Investment</span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-600 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors" />
                                </div>
                            </div>

                            <div className="bg-slate-100 dark:bg-gray-800/20 p-4 rounded-2xl border border-slate-200 dark:border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-700 dark:text-white font-medium">Solutions Architect</span>
                                    <span className="text-slate-500 dark:text-gray-500 text-xs">Locked</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-gray-600 mt-2">Complete Cloud Practitioner to unlock this certification path.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="text-center pt-8 opacity-60 hover:opacity-100 transition-opacity">
                         <button 
                            onClick={handleReset}
                            className="group text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-full hover:bg-red-500/10 transition-all"
                         >
                            <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            Reset Account
                         </button>
                         <p className="text-[10px] text-slate-500 dark:text-gray-600 mt-4 font-mono">
                            DEVOPS_QUEST v2.1.0 <br/> 
                            <span className="opacity-50 text-emerald-600 dark:text-emerald-500">Secure Connection Verified</span>
                         </p>
                    </div>
                </div>
            </div>
          </main>
          
          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-devops-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-40 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map(navItem => (
                    <button
                        key={navItem.id}
                        onClick={() => {
                            setView(navItem.id as any);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
                            view === navItem.id ? 'text-emerald-600 dark:text-devops-accent' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {view === navItem.id && <div className="absolute top-0 w-8 h-1 bg-emerald-600 dark:bg-devops-accent rounded-b-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                        <navItem.icon className={`w-5 h-5 ${view === navItem.id ? 'scale-110 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : ''} transition-all`} />
                        <span className="text-[10px] font-medium">{navItem.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>
          </div>

          {/* Floating AI Mentor */}
          <AiMentor userStats={stats} />
        </div>
      );
  };

  return (
    <div className={isDark ? "dark" : ""}>
        {content()}
    </div>
  );
};

export default App;
