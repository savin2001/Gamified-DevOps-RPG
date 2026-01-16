
import React, { useState, useEffect } from 'react';
import { Rocket, Brain, Terminal, Trophy, Moon, Sun, ArrowRight, Code, Zap, ChevronRight, Layout, Activity, Star, Bot, BookOpen, Share2 } from 'lucide-react';
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

const HERO_PHRASES = [
    "Cloud Mastery",
    "DevOps Excellence",
    "Kubernetes Skills",
    "Infrastructure as Code",
    "CI/CD Pipelines",
    "SRE Proficiency"
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isDark, setIsDark] = useState(true);
  const [showManifesto, setShowManifesto] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
    }, 3000); // Cycle every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (showManifesto) {
      return <Manifesto onBack={() => setShowManifesto(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-blue-500/30 ${isDark ? 'bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'} relative overflow-x-hidden`}>
        <style>{`
            @keyframes text-slide-up {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes float-mascot {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(50px, 30px) rotate(5deg); }
                50% { transform: translate(20px, 80px) rotate(-5deg); }
                75% { transform: translate(-40px, 40px) rotate(3deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }
            @keyframes blink {
                0%, 96%, 100% { transform: scaleY(1); }
                98% { transform: scaleY(0.1); }
            }
        `}</style>

        {/* Mascot - Floating in Background */}
        <div className="absolute top-32 right-10 md:right-32 z-0 opacity-40 md:opacity-100 pointer-events-none hidden lg:block" aria-hidden="true">
            <div className="animate-[float-mascot_20s_ease-in-out_infinite]">
                 <div className={`relative w-32 h-32 md:w-48 md:h-48 transition-colors duration-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {/* Robot Body */}
                      <Bot className="w-full h-full drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]" />
                      
                      {/* Animated Eyes */}
                      <div className="absolute top-[35%] left-[28%] w-2 h-2 md:w-3 md:h-3 bg-white rounded-full animate-[blink_4s_infinite_ease-in-out]"></div>
                      <div className="absolute top-[35%] right-[28%] w-2 h-2 md:w-3 md:h-3 bg-white rounded-full animate-[blink_4s_infinite_ease-in-out]"></div>
                      
                      {/* Status Light */}
                      <div className="absolute top-0 right-2 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)] border-2 border-white/20"></div>

                      {/* Thruster Flame */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-t from-transparent to-orange-500 rounded-full blur-md opacity-60 animate-pulse"></div>
                 </div>
            </div>
        </div>

        {/* Navbar */}
        <header>
            <nav className={`fixed w-full z-50 backdrop-blur-xl border-b transition-colors duration-500 ${isDark ? 'border-white/5 bg-[#030712]/70' : 'border-slate-200 bg-white/70'}`} aria-label="Main Navigation">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className={`p-2 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-blue-500/20' : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-blue-200'}`}>
                            <Rocket className="w-6 h-6 text-white" aria-hidden="true" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">DevOps<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Quest</span></span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme} 
                            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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
                            aria-label="Login to DevOps Quest"
                        >
                            Login <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </nav>
        </header>

        <main>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col justify-center" aria-label="Hero">
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

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight min-h-[3.5em] md:min-h-[2.5em]">
                        Gamify Your Path to <br className="hidden md:block"/>
                        <span 
                            key={phraseIndex}
                            className={`inline-block text-transparent bg-clip-text bg-gradient-to-r animate-[text-slide-up_0.5s_ease-out_forwards] ${isDark ? 'from-blue-400 via-purple-400 to-pink-400' : 'from-blue-600 via-purple-600 to-pink-600'}`}
                        >
                            {HERO_PHRASES[phraseIndex]}
                        </span>
                    </h1>

                    <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Ditch the boring tutorials. Embark on a 48-week role-playing campaign where every lab is a quest, every commit is XP, and your mentor is an AI.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={onStart}
                            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5 fill-current" aria-hidden="true" /> Start Your Quest
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
            <section id="features" className={`py-32 px-6 relative transition-colors duration-500 ${isDark ? 'bg-black/20' : 'bg-slate-100/50'}`} aria-label="Key Features">
                 <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Complete DevOps Ecosystem</h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Everything you need to go from Zero to Cloud Hero, all in one dashboard.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            isDark={isDark}
                            icon={Trophy}
                            color="yellow"
                            title="Rank Up System"
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
                        <FeatureCard 
                            isDark={isDark}
                            icon={BookOpen}
                            color="blue"
                            title="Engineering Journal"
                            desc="A 'Second Brain' for your learning. Log daily insights, mood, and track your focus sessions."
                        />
                        <FeatureCard 
                            isDark={isDark}
                            icon={Share2}
                            color="pink"
                            title="Artifact Publishing"
                            desc="Generate markdown reports of your labs and study logs to push directly to your GitHub portfolio."
                        />
                        <FeatureCard 
                            isDark={isDark}
                            icon={Layout}
                            color="indigo"
                            title="Project Portfolio"
                            desc="Unlock capstone projects as you progress. Build real-world infrastructure and architecture."
                        />
                    </div>
                 </div>
            </section>

            {/* Live Dashboard Preview */}
            <section className="py-20 px-6 overflow-hidden" aria-label="Dashboard Preview">
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
                            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 p-4 md:p-8" aria-hidden="true">
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
                                        aria-label="Login to Access Full System"
                                    >
                                        Login to Access Full System <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                 </div>
                            </div>
                      </div>
                 </div>
            </section>
        </main>

        {/* Footer */}
        <footer className={`py-12 px-6 border-t ${isDark ? 'border-white/5 bg-black/20 text-slate-500' : 'border-slate-200 bg-white text-slate-400'}`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <Rocket className="w-5 h-5" aria-hidden="true" />
                    <span className="font-bold">DevOps Quest</span>
                 </div>
                 <nav className="flex gap-6 text-sm font-medium" aria-label="Footer Navigation">
                     <a href="https://github.com/savin2001/devops-learning-journey/blob/main/DevOps_Learning_Path_12_Month_Curriculum.pdf" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">Curriculum</a>
                     <button onClick={() => setShowManifesto(true)} className="hover:text-blue-500 transition-colors text-left">Manifesto</button>
                     <a href="https://github.com/savin2001/devops-learning-journey" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
                 </nav>
                 <p className="text-xs font-mono">Built for cloud engineers, by cloud engineers.</p>
            </div>
        </footer>
    </div>
  );
};

const FeatureCard = ({ isDark, icon: Icon, color, title, desc }: any) => {
    const colorClasses: any = {
        yellow: isDark ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-yellow-100 text-yellow-600 border-yellow-200',
        purple: isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-100 text-purple-600 border-purple-200',
        green: isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-600 border-green-200',
        blue: isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-600 border-blue-200',
        pink: isDark ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-pink-100 text-pink-600 border-pink-200',
        indigo: isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-100 text-indigo-600 border-indigo-200',
    };

    return (
        <article className={`p-8 rounded-[2rem] border transition-all duration-300 hover:-translate-y-2 group h-full flex flex-col ${
            isDark 
            ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]' 
            : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl'
        }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 border ${colorClasses[color]}`} aria-hidden="true">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <p className={`leading-relaxed text-sm flex-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
        </article>
    );
};

export default LandingPage;
