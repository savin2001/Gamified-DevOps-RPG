
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
import { Rocket, History, LayoutDashboard, Book, Beaker, Trash2, Code, Edit3, Menu, X } from 'lucide-react';

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

  if (!stats) return <div className="min-h-screen bg-devops-dark flex items-center justify-center text-white">Loading Quest...</div>;

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
    <div className="min-h-screen bg-devops-dark text-slate-200 font-sans pb-24 md:pb-12 relative">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-devops-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-devops-accent p-2 rounded-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="font-mono font-bold text-xl text-white tracking-tight">DevOps<span className="text-devops-accent">Quest</span></span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex gap-2">
                {navItems.map(navItem => (
                    <button 
                        key={navItem.id}
                        onClick={() => setView(navItem.id as any)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            view === navItem.id ? 'bg-gray-800 text-white border border-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    >
                        <navItem.icon className="w-4 h-4" />
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
          <div className="md:hidden bg-devops-card border-b border-gray-700 shadow-xl absolute w-full left-0 z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map(navItem => (
                <button
                  key={navItem.id}
                  onClick={() => {
                    setView(navItem.id as any);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    view === navItem.id 
                      ? 'bg-gray-800 text-white border border-gray-700' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
                {/* Always show dashboard stats at top if on Dashboard view */}
                {view === 'dashboard' && <Dashboard stats={stats} xpHistory={cumulativeChartData} />}
                
                <div className="min-h-[500px]">
                    {view === 'dashboard' && (
                        <div className="space-y-8">
                            <div className="bg-devops-card rounded-xl border border-gray-700 shadow-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <History className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                                </div>
                                <div className="space-y-3">
                                    {logs.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No activities logged yet. Go to Study to begin!</p>
                                    ) : (
                                        logs.slice(0, 5).map(log => (
                                            <div key={log.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                                <div>
                                                    <p className="text-sm text-white font-medium">{log.type.replace('_', ' ')}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-sm">{log.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-devops-success text-sm font-bold">+{log.xpEarned} XP</span>
                                                    <p className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</p>
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
            <div className="lg:col-span-1 space-y-8">
                
                {/* Cert Progress Micro-component */}
                <div className="bg-devops-card rounded-xl border border-gray-700 shadow-lg p-6">
                    <h3 className="font-bold text-white mb-4">Certification Path</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-3 rounded-lg border border-yellow-500/30">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-white">AWS Cloud Practitioner</span>
                                <span className="text-yellow-400">Week 1/12</span>
                            </div>
                            <div className="w-full bg-gray-900 rounded-full h-1.5">
                                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '8%' }}></div>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg opacity-50">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-white">Solutions Architect</span>
                                <span className="text-gray-400">Upcoming</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="text-center pt-8">
                     <button 
                        onClick={handleReset}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1 mx-auto transition-colors opacity-60 hover:opacity-100"
                     >
                        <Trash2 className="w-3 h-3" />
                        Reset All Progress
                     </button>
                     <p className="text-[10px] text-gray-600 mt-2">DevOps Quest v2.0.0</p>
                </div>
            </div>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-devops-dark/95 backdrop-blur-lg border-t border-gray-800 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
            {navItems.map(navItem => (
                <button
                    key={navItem.id}
                    onClick={() => {
                        setView(navItem.id as any);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                        view === navItem.id ? 'text-devops-accent' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <navItem.icon className={`w-5 h-5 ${view === navItem.id ? 'scale-110' : ''} transition-transform`} />
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
