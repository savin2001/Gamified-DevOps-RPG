
import React, { useState } from 'react';
import { Rocket, Brain, Terminal, Trophy, Moon, Sun, ArrowRight, Code, Zap, ChevronRight, Layout, Activity, Star } from 'lucide-react';
import Dashboard from './Dashboard';
import { UserStats } from '../types';
import Manifesto from './Manifesto';

interface LandingPageProps {
  onStart: () => void;
}

const PREVIEW_STATS: UserStats = {
    xp: 3450,
    level: 7,
    streak: 12,
    lastActivityDate: new Date().toISOString(),
    totalStudyHours: 128,
    sessionsCompleted: 45,
    projectsCompleted: 3,
    labsCompleted: 24,
    quizzesCompleted: 12,
    certificationsEarned: 1
};

const PREVIEW_HISTORY = [
    { date: 'Mon', xp: 2800 },
    { date: 'Tue', xp: 2950 },
    { date: 'Wed', xp: 3100 },
    { date: 'Thu', xp: 3150 },
    { date: 'Fri', xp: 3300 },
    { date: 'Sat', xp: 3450 },
    { date: 'Sun', xp: 3450 },
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isDark, setIsDark] = useState(true);
  const [showManifesto, setShowManifesto] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  if (showManifesto) {
      return <Manifesto onBack={() => setShowManifesto(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-blue-500/30 ${isDark ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Navbar */}
        <nav className={`fixed w-full z-50 backdrop-blur-xl border-b transition-colors duration-500 ${isDark ? 'border-white/5 bg-[#030712]/70' : 'border-slate-200 bg-white/70'}`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-blue-500/20' : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-blue-200'}`}>
                        <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">DevOps<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Quest</span></span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleTheme} 
                        className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={onStart}
                        className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg ${
                            isDark 
                            ? 'bg-white text-black hover:bg-slate-200 shadow-white/10' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                        }`}
                    >
                        Login <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
             {/* Background Effects */}
             <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[120px] -z-10 transition-colors duration-700 opacity-40 ${isDark ? 'bg-gradient-to-b from-purple-900/60 to-blue-900/40' : 'bg-gradient-to-b from-purple-300/60 to-blue-300/40'}`}></div>
             
             {/* Grid Pattern Overlay */}
             <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none`}></div>

             <div className="max-w-5xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10 text-blue-300' : 'bg-white/60 border-slate-200 text-blue-600 shadow-sm'}`}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">v2.1 System Online</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
                    Gamify Your Path to <br className="hidden md:block"/>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r animate-gradient-x ${isDark ? 'from-blue-400 via-purple-400 to-pink-400' : 'from-blue-600 via-purple-600 to-pink-600'}`}>Cloud Mastery</span>
                </h1>

                <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ditch the boring tutorials. Embark on a 48-week role-playing campaign where every lab is a quest, every commit is XP, and your mentor is an AI.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={onStart}
                        className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Zap className="w-5 h-5 fill-current" /> Start Your Quest
                    </button>
                    <a href="#features" className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg transition-all border flex items-center justify-center gap-2 ${
                        isDark 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-white/20' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-lg shadow-slate-200/50'
                    }`}>
                        Explore Features
                    </a>
                </div>
             </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 relative">
             <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
                <FeatureCard 
                    isDark={isDark}
                    icon={Trophy}
                    color="yellow"
                    title="Rank Up"
                    desc="Earn XP for studying, labs, and projects. Climb the leaderboard from Cloud Seedling to DevOps Master."
                />
                <FeatureCard 
                    isDark={isDark}
                    icon={Brain}
                    color="purple"
                    title="AI Mentor"
                    desc="Stuck on a config? Your Gemini-powered mentor provides real-time guidance, code snippets, and motivation."
                />
                <FeatureCard 
                    isDark={isDark}
                    icon={Terminal}
                    color="green"
                    title="Lab Simulations"
                    desc="Verify your skills in simulated terminal environments. Execute commands and get instant feedback."
                />
             </div>
        </section>

        {/* Live Dashboard Preview */}
        <section className="py-20 px-6 overflow-hidden">
             <div className={`max-w-6xl mx-auto rounded-[2.5rem] border p-3 md:p-4 relative transition-all duration-500 ${isDark ? 'bg-gray-800/50 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-2xl shadow-blue-900/10'}`}>
                  {/* Mock Window Controls */}
                  <div className={`absolute top-0 left-0 right-0 h-14 border-b flex items-center px-6 gap-2 rounded-t-[2.5rem] ${isDark ? 'bg-gray-900/50 border-white/5' : 'bg-slate-50 border-slate-200'} z-20`}>
                      <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm"></div>
                      <div className={`ml-4 text-[10px] font-mono opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>~/devops-quest/dashboard/preview</div>
                      <div className="ml-auto flex items-center gap-2">
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className={`text-[10px] font-bold tracking-wider ${isDark ? 'text-green-400' : 'text-green-600'}`}>LIVE DEMO</span>
                      </div>
                  </div>
                  
                  {/* Content Preview Mockup */}
                  <div className={`mt-14 rounded-2xl overflow-hidden aspect-[16/10] relative group border ${isDark ? 'bg-[#030712] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        {/* Render Actual Dashboard as Preview (Scaled Down) */}
                        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 p-4 md:p-8">
                             {/* Wrapper to ensure dark mode styles of dashboard work even in light mode landing */}
                             <div className="bg-[#030712] p-6 rounded-3xl min-h-full">
                                <Dashboard stats={PREVIEW_STATS} xpHistory={PREVIEW_HISTORY} />
                             </div>
                        </div>

                        {/* Interactive overlay that invites to login */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent pointer-events-none flex items-end justify-center pb-10">
                             <div className="pointer-events-auto">
                                <button 
                                    onClick={onStart}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-500/40 animate-bounce transition-all hover:scale-110 flex items-center gap-2"
                                >
                                    Login to Access Full System <ArrowRight className="w-4 h-4" />
                                </button>
                             </div>
                        </div>
                  </div>
             </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 px-6 border-t ${isDark ? 'border-white/5 bg-black/20 text-slate-500' : 'border-slate-200 bg-white text-slate-400'}`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <Rocket className="w-5 h-5" />
                    <span className="font-bold">DevOps Quest</span>
                 </div>
                 <div className="flex gap-6 text-sm font-medium">
                     <a href="https://github.com/savin2001/devops-learning-journey/blob/main/DevOps_Learning_Path_12_Month_Curriculum.pdf" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">Curriculum</a>
                     <button onClick={() => setShowManifesto(true)} className="hover:text-blue-500 transition-colors text-left">Manifesto</button>
                     <a href="https://github.com/savin2001/devops-learning-journey" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
                 </div>
                 <p className="text-xs font-mono">Built for cloud engineers, by cloud engineers.</p>
            </div>
        </footer>
    </div>
  );
};

const FeatureCard = ({ isDark, icon: Icon, color, title, desc }: any) => {
    const colorClasses: any = {
        yellow: isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
        purple: isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600',
        green: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600',
    };

    return (
        <div className={`p-8 rounded-[2rem] border transition-all duration-300 hover:-translate-y-2 group ${
            isDark 
            ? 'bg-white/5 border-white/5 hover:bg-white/10' 
            : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl'
        }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorClasses[color]}`}>
                <Icon className="w-7 h-7" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <p className={`leading-relaxed text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
        </div>
    );
};

export default LandingPage;
