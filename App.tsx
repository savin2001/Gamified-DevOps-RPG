
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

      if (!stats) return <div className="min-h-screen flex items-center justify-center font-mono dark:text-white text-slate-900 bg-surface-light dark:bg-surface-dark">Loading Member Profile...</div>;

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
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-slate-200 font-sans pb-24 md:pb-12 relative overflow-x-hidden transition-colors duration-300">
          
          {/* Subtle Background Pattern (Corporate) */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
              {/* Very subtle gradient wash */}
              <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-navy-50/50 to-transparent dark:from-navy-950/30 dark:to-transparent"></div>
          </div>

          {/* Header - Solid, Reliable Navigation Bar */}
          <nav className="border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-surface-cardDark/90 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('dashboard')}>
                  <div className="bg-brand-600 p-1.5 rounded-lg shadow-sm">
                        <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-sans font-bold text-xl dark:text-white text-navy-900 tracking-tight">DevOps<span className="text-brand-600 dark:text-brand-400">Quest</span></span>
                </div>
                
                {/* Desktop Nav - Clean Tabs */}
                <div className="hidden md:flex gap-1">
                    {navItems.map(navItem => (
                        <button 
                            key={navItem.id}
                            onClick={() => setView(navItem.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                view === navItem.id 
                                ? 'bg-navy-50 dark:bg-white/10 text-navy-700 dark:text-white' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                            <navItem.icon className={`w-4 h-4 ${view === navItem.id ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                            {navItem.label}
                        </button>
                    ))}
                </div>

                {/* User Profile / Logout / Theme */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="text-right mr-2">
                        <div className="text-xs font-bold dark:text-white text-navy-900">{user.username}</div>
                        <div className="text-[10px] text-brand-600 dark:text-brand-400 uppercase font-bold tracking-wider">{user.role}</div>
                    </div>
                    
                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

                    <button 
                        onClick={toggleTheme} 
                        className="p-2 text-slate-500 hover:text-navy-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                        title="Toggle Theme"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button 
                        onClick={handleLogout} 
                        className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
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
                    className="text-slate-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white p-2"
                    aria-label="Toggle menu"
                  >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="md:hidden bg-white dark:bg-surface-cardDark border-b border-slate-200 dark:border-white/10 shadow-xl absolute w-full left-0 z-50">
                <div className="px-4 pt-2 pb-4 space-y-2">
                  {navItems.map(navItem => (
                    <button
                      key={navItem.id}
                      onClick={() => {
                        setView(navItem.id as any);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        view === navItem.id 
                          ? 'bg-navy-50 dark:bg-white/10 text-navy-800 dark:text-white' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <navItem.icon className={`w-5 h-5 ${view === navItem.id ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                      {navItem.label}
                    </button>
                  ))}
                  <div className="border-t border-slate-200 dark:border-white/10 my-2 pt-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium">
                          <LogOut className="w-5 h-5" /> Logout
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
                                <div className="bg-white dark:bg-surface-cardDark rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-navy-50 dark:bg-white/5 rounded-lg">
                                          <Activity className="w-5 h-5 text-navy-600 dark:text-navy-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-navy-900 dark:text-white">Recent Transactions</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {logs.length === 0 ? (
                                            <p className="text-slate-500 dark:text-gray-500 text-sm italic py-4 text-center">No activities logged yet.</p>
                                        ) : (
                                            logs.slice(0, 5).map((log, idx) => (
                                                <div key={log.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-mono text-slate-400 dark:text-slate-600">{String(idx + 1).padStart(2, '0')}</span>
                                                        <div>
                                                            <p className="text-sm text-navy-900 dark:text-white font-semibold">{log.type.replace('_', ' ')}</p>
                                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">{log.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-brand-600 dark:text-brand-400 text-sm font-bold">+{log.xpEarned} XP</span>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleDateString()}</p>
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
                    
                    {/* Cert Progress - Gold Card */}
                    <div className="bg-gradient-to-br from-gold-50 to-white dark:from-gold-900/10 dark:to-surface-cardDark border border-gold-200 dark:border-gold-500/20 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold-500"></span>
                            Certification Path
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-gold-100 dark:border-gold-500/20">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-semibold text-navy-900 dark:text-white">AWS Cloud Practitioner</span>
                                    <span className="text-xs font-mono text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-500/10 px-2 py-0.5 rounded">WK 1/12</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-gold-500 h-full rounded-full" style={{ width: '8%' }}></div>
                                </div>
                                <div className="mt-3 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                    <span className="uppercase tracking-wider font-semibold">Active Investment</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 opacity-60">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Solutions Architect</span>
                                    <span className="text-xs text-slate-400">Locked</span>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Complete foundational tier to unlock.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="text-center pt-8">
                         <button 
                            onClick={handleReset}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                         >
                            <Trash2 className="w-3 h-3" />
                            Reset Account
                         </button>
                         <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-4 font-mono">
                            DEVOPS_QUEST v2.2.0 <br/> 
                            <span className="text-brand-600 dark:text-brand-500">System Nominal</span>
                         </p>
                    </div>
                </div>
            </div>
          </main>
          
          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-cardDark border-t border-slate-200 dark:border-white/10 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map(navItem => (
                    <button
                        key={navItem.id}
                        onClick={() => {
                            setView(navItem.id as any);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                            view === navItem.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                    >
                        <navItem.icon className="w-5 h-5" />
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
