
import React, { useState, useEffect } from 'react';
import { Rocket, Brain, Terminal, Trophy, Moon, Sun, ArrowRight, Code, Zap, ChevronRight, Layout, Activity, Star, Bot, BookOpen, Share2 } from 'lucide-react';
import Dashboard from './Dashboard';
import { UserStats } from '../types';
import Manifesto from './Manifesto';

interface LandingPageProps {
  onStart: () => void;
  isDark: boolean;
  toggleTheme: () => void;
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

const LandingPage: React.FC<LandingPageProps> = ({ onStart, isDark, toggleTheme }) => {
  const [showManifesto, setShowManifesto] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  if (showManifesto) {
      return <Manifesto onBack={() => setShowManifesto(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-brand-500/30 ${isDark ? 'bg-surface-dark text-white' : 'bg-surface-light text-slate-900'} relative overflow-x-hidden`}>
        <style>{`
            @keyframes text-slide-up {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
        `}</style>

        {/* Navbar */}
        <header>
            <nav className={`fixed w-full z-50 backdrop-blur-md border-b transition-colors duration-500 ${isDark ? 'border-white/10 bg-surface-dark/80' : 'border-slate-200 bg-white/80'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className={`p-1.5 rounded-lg shadow-sm ${isDark ? 'bg-brand-600' : 'bg-brand-600'}`}>
                            <Rocket className="w-5 h-5 text-white" aria-hidden="true" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">DevOps<span className="text-brand-600 dark:text-brand-400">Quest</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme} 
                            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button 
                            onClick={onStart}
                            className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-md ${
                                isDark 
                                ? 'bg-white text-navy-900 hover:bg-slate-100' 
                                : 'bg-navy-900 text-white hover:bg-navy-800'
                            }`}
                        >
                            Login <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>
        </header>

        <main>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
                 {/* Background Effects - Standard Gradients, No Neon Blobs */}
                 <div className={`absolute top-0 left-0 w-full h-[800px] -z-10 transition-colors duration-700 ${
                     isDark 
                     ? 'bg-gradient-to-b from-navy-950 via-surface-dark to-surface-dark' 
                     : 'bg-gradient-to-b from-navy-50 via-surface-light to-surface-light'
                 }`}></div>
                 
                 <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none`}></div>

                 <div className="max-w-5xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border ${isDark ? 'bg-white/5 border-white/10 text-brand-400' : 'bg-white border-slate-200 text-brand-700 shadow-sm'}`}>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider">Secure. Stable. Scalable.</span>
                    </div>

                    <h1 className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight min-h-[3.5em] md:min-h-[2.5em] ${isDark ? 'text-white' : 'text-navy-900'}`}>
                        Invest in Your <br className="hidden md:block"/>
                        <span 
                            key={phraseIndex}
                            className="inline-block text-brand-600 dark:text-brand-400 animate-[text-slide-up_0.5s_ease-out_forwards]"
                        >
                            {HERO_PHRASES[phraseIndex]}
                        </span>
                    </h1>

                    <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Bank on your future with a premium 48-week curriculum. Build professional equity through rigorous labs, structured projects, and AI-driven mentorship.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={onStart}
                            className="w-full sm:w-auto px-10 py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5 fill-current" /> Begin Journey
                        </button>
                        <button 
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className={`w-full sm:w-auto px-10 py-5 rounded-xl font-bold text-lg transition-all border flex items-center justify-center gap-2 ${
                                isDark 
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-md'
                            }`}
                        >
                            View Curriculum
                        </button>
                    </div>
                 </div>
            </section>

            {/* Features Grid */}
            <section id="features" className={`py-32 px-6 relative transition-colors duration-500 ${isDark ? 'bg-surface-cardDark' : 'bg-white'}`}>
                 <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-navy-900'}`}>Enterprise Grade Learning</h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            A robust ecosystem designed for reliability and career growth.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            isDark={isDark}
                            icon={Trophy}
                            color="gold"
                            title="Credit Your Skills"
                            desc="Deposit knowledge daily. Earn XP and compound your learning interest to reach 'Master' status."
                        />
                        <FeatureCard 
                            isDark={isDark}
                            icon={Brain}
                            color="emerald"
                            title="AI Advisory"
                            desc="Your personal technical consultant. Get real-time architectural advice and code reviews 24/7."
                        />
                        <FeatureCard 
                            isDark={isDark}
                            icon={Terminal}
                            color="navy"
                            title="Secure Sandboxes"
                            desc="Execute labs in risk-free environments. Verify infrastructure logic before deployment."
                        />
                        <FeatureCard 
                            isDark={isDark}
                            icon={BookOpen}
                            color="teal"
                            title="Ledger of Learning"
                            desc="Log your daily technical transactions. Track mood, focus, and energy assets in your journal."
                        />
                        <FeatureCard 
                            isDark={isDark}
                            icon={Share2}
                            color="red"
                            title="Public Equity"
                            desc="Publish your artifacts to GitHub. Build a portfolio that demonstrates verifiable value."
                        />
                        <FeatureCard 
                            isDark={isDark}
                            icon={Layout}
                            color="slate"
                            title="Capstone Architecture"
                            desc="Build enterprise-ready infrastructure projects that prove your worth to future employers."
                        />
                    </div>
                 </div>
            </section>

            {/* Live Dashboard Preview */}
            <section className={`py-20 px-6 overflow-hidden ${isDark ? 'bg-surface-dark' : 'bg-slate-50'}`}>
                 <div className={`max-w-6xl mx-auto rounded-3xl border p-4 relative transition-all duration-500 ${isDark ? 'bg-surface-cardDark border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
                      {/* Mock Window Controls */}
                      <div className={`absolute top-0 left-0 right-0 h-12 border-b flex items-center px-6 gap-2 rounded-t-3xl ${isDark ? 'bg-surface-dark/50 border-white/5' : 'bg-slate-50 border-slate-200'} z-20`}>
                          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                          <div className={`ml-4 text-[10px] font-mono opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>~/devops/banking/dashboard</div>
                      </div>
                      
                      {/* Content Preview Mockup */}
                      <div className={`mt-12 rounded-xl overflow-hidden h-[600px] md:h-auto md:aspect-[16/10] relative group border ${isDark ? 'bg-surface-dark border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            {/* Render Actual Dashboard as Preview */}
                            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 p-2 md:p-8" aria-hidden="true">
                                 {/* Wrapper to force dark mode styles inside the preview container regardless of current theme to show "Pro" look */}
                                 <div className="dark">
                                     <div className="bg-surface-cardDark text-white p-6 rounded-2xl min-h-full">
                                        <Dashboard stats={PREVIEW_STATS} xpHistory={PREVIEW_HISTORY} />
                                     </div>
                                 </div>
                            </div>

                            <div className={`absolute inset-0 bg-gradient-to-t pointer-events-none flex items-end justify-center pb-10 ${isDark ? 'from-surface-dark' : 'from-white'}`}>
                                 <div className="pointer-events-auto">
                                    <button 
                                        onClick={onStart}
                                        className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        Access Member Portal <ArrowRight className="w-4 h-4" />
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
                    <Rocket className="w-5 h-5" />
                    <span className="font-bold">DevOps Quest</span>
                 </div>
                 <nav className="flex gap-6 text-sm font-medium">
                     <a href="#" className="hover:text-brand-500 transition-colors">Curriculum</a>
                     <button onClick={() => setShowManifesto(true)} className="hover:text-brand-500 transition-colors text-left">Manifesto</button>
                     <a href="#" className="hover:text-brand-500 transition-colors">GitHub</a>
                 </nav>
                 <p className="text-xs font-mono">Reliability. Integrity. Engineering.</p>
            </div>
        </footer>
    </div>
  );
};

const FeatureCard = ({ isDark, icon: Icon, color, title, desc }: any) => {
    const colorClasses: any = {
        gold: isDark ? 'bg-gold-900/10 text-gold-500 border-gold-500/20' : 'bg-gold-50 text-gold-700 border-gold-200',
        emerald: isDark ? 'bg-brand-900/10 text-brand-400 border-brand-500/20' : 'bg-brand-50 text-brand-700 border-brand-200',
        navy: isDark ? 'bg-navy-900/30 text-navy-300 border-navy-500/20' : 'bg-navy-50 text-navy-700 border-navy-200',
        teal: isDark ? 'bg-teal-900/10 text-teal-400 border-teal-500/20' : 'bg-teal-50 text-teal-700 border-teal-200',
        red: isDark ? 'bg-red-900/20 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200',
        slate: isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200',
    };

    return (
        <article className={`p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 group h-full flex flex-col ${
            isDark 
            ? 'bg-white/5 border-white/5 hover:bg-white/10' 
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
        }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 border ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-navy-900'}`}>{title}</h3>
            <p className={`leading-relaxed text-sm flex-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
        </article>
    );
};

export default LandingPage;
