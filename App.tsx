
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CurriculumView from './components/CurriculumView';
import StudySession from './components/StudySession';
import LabHub from './components/LabHub';
import ProjectHub from './components/ProjectHub';
import BlogHub from './components/BlogHub';
import AiMentor from './components/AiMentor';
import { UserStats, ActivityLog, ActivityType } from './types';
import { getStoredStats, getActivityHistory, logActivity, resetProgress } from './services/gamificationService';
import { Rocket, History, LayoutDashboard, Book, Beaker, Trash2, Code, Edit3, Menu, X, ChevronRight, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [view, setView] = useState<'dashboard' | 'curriculum' | 'study' | 'labs' | 'projects' | 'blog'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Hydrate state from local storage on mount
    setStats(getStoredStats());
    setLogs(getActivityHistory());
  }, []);

  const refreshStats = () => {
    setStats(getStoredStats());
    setLogs(getActivityHistory());
  }

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      const initial = resetProgress();
      setStats(initial);
      setLogs([]);
      window.location.reload(); // Ensure all sub-components re-mount clean
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'study', icon: Book, label: 'Study' },
    { id: 'labs', icon: Beaker, label: 'Labs' },
    { id: 'projects', icon: Code, label: 'Projects' },
    { id: 'blog', icon: Edit3, label: 'Blog & Commit' },
  ];

  if (!stats) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white font-mono">INITIALIZING SYSTEM...</div>;

  // Transform logs for chart data (simple aggregation for demo)
  const chartData = logs.slice(0, 30).reverse().map(log => ({
    date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    xp: log.xpEarned
  }));

  // Create cumulative XP for the chart
  const cumulativeChartData = [];
  let runningTotal = stats.xp - logs.reduce((acc, curr) => acc + curr.xpEarned, 0); 
  
  // Re-build history forward
  for (const log of logs.slice().reverse()) {
      runningTotal += log.xpEarned;
      cumulativeChartData.push({
          date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          xp: runningTotal
      });
  }
  if (cumulativeChartData.length === 0) {
      cumulativeChartData.push({ date: 'Start', xp: 0 }); // Start at 0 for clean slate
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans pb-24 md:pb-12 relative overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Global Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* Header */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-xl border border-white/10 relative z-10">
                    <Rocket className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-sans font-bold text-xl text-white tracking-tight">DevOps<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Quest</span></span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
                {navItems.map(navItem => (
                    <button 
                        key={navItem.id}
                        onClick={() => setView(navItem.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            view === navItem.id 
                            ? 'bg-gray-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <navItem.icon className={`w-4 h-4 ${view === navItem.id ? 'text-blue-400' : ''}`} />
                        {navItem.label}
                    </button>
                ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white p-2"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown (Top) */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#0a0f1e] border-b border-white/10 shadow-2xl absolute w-full left-0 z-50 backdrop-blur-xl">
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
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <navItem.icon className="w-5 h-5" />
                  {navItem.label}
                </button>
              ))}
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
                            <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                                      <Activity className="w-5 h-5 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
                                </div>
                                <div className="space-y-3 relative z-10">
                                    {logs.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">No activities logged yet. Go to Study to begin!</p>
                                    ) : (
                                        logs.slice(0, 5).map((log, idx) => (
                                            <div key={log.id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300 group/item">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-mono text-gray-500 opacity-50">{String(idx + 1).padStart(2, '0')}</span>
                                                    <div>
                                                        <p className="text-sm text-white font-medium group-hover/item:text-blue-300 transition-colors">{log.type.replace('_', ' ')}</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-[150px] sm:max-w-xs">{log.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-green-400 text-sm font-bold bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">+{log.xpEarned} XP</span>
                                                    <p className="text-[10px] text-gray-600 mt-1 font-mono">{new Date(log.timestamp).toLocaleDateString()}</p>
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
                </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Cert Progress Micro-component */}
                <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                    
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        Certification Path
                    </h3>
                    
                    <div className="space-y-4 relative z-10">
                        <div className="group bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-white font-medium">AWS Cloud Practitioner</span>
                                <span className="text-yellow-400 font-mono text-xs bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">WK 1/12</span>
                            </div>
                            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
                                <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: '8%' }}></div>
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">In Progress</span>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition-colors" />
                            </div>
                        </div>

                        <div className="bg-gray-800/20 p-4 rounded-2xl border border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-white font-medium">Solutions Architect</span>
                                <span className="text-gray-500 text-xs">Locked</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">Complete Cloud Practitioner to unlock this certification path.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="text-center pt-8 opacity-60 hover:opacity-100 transition-opacity">
                     <button 
                        onClick={handleReset}
                        className="group text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-full hover:bg-red-500/10 transition-all"
                     >
                        <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        Reset System Progress
                     </button>
                     <p className="text-[10px] text-gray-600 mt-4 font-mono">
                        DEVOPS_QUEST_OS v2.0.4 <br/> 
                        <span className="opacity-50">System Stable</span>
                     </p>
                </div>
            </div>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
            {navItems.map(navItem => (
                <button
                    key={navItem.id}
                    onClick={() => {
                        setView(navItem.id as any);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
                        view === navItem.id ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    {view === navItem.id && <div className="absolute top-0 w-8 h-1 bg-blue-500 rounded-b-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                    <navItem.icon className={`w-5 h-5 ${view === navItem.id ? 'scale-110 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : ''} transition-all`} />
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

export default App;
