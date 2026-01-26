
import React from 'react';
import { ArrowLeft, Rocket, Zap, Shield, Heart, Terminal, Users, Brain, Target, Coffee } from 'lucide-react';

interface ManifestoProps {
  onBack: () => void;
}

const Manifesto: React.FC<ManifestoProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-surface-dark text-slate-200 font-sans selection:bg-navy-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-navy-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[60%] bg-blue-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        <button 
            onClick={onBack}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all mb-12 text-gray-400 hover:text-white"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        <header className="mb-20 text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500/20 to-navy-500/20 rounded-2xl border border-white/10 mb-6 shadow-2xl shadow-navy-900/20">
                <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gold-200">
                The DevOps Manifesto
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                We believe learning Cloud Engineering shouldn't feel like reading a phone book. 
                It should feel like an adventure.
            </p>
        </header>

        <div className="space-y-24">
            {/* Principle 1 */}
            <section className="group">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="shrink-0 p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
                        <Zap className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Consistency Over Intensity</h2>
                        <p className="text-gray-400 leading-loose text-lg">
                            Cramming for 10 hours on a Sunday is useless if you quit by Wednesday. 
                            We value the <span className="text-yellow-400 font-bold">daily streak</span>. 
                            Showing up for 30 minutes every day is the secret weapon of senior engineers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Principle 2 */}
            <section className="group">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="shrink-0 p-4 bg-green-500/10 rounded-2xl border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                        <Terminal className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Builders, Not Consumers</h2>
                        <p className="text-gray-400 leading-loose text-lg">
                            Tutorial hell is real. We escape it by <span className="text-green-400 font-bold">doing</span>. 
                            Every concept must be accompanied by a command executed, a resource deployed, or a script written. 
                            If it's not in git, it didn't happen.
                        </p>
                    </div>
                </div>
            </section>

            {/* Principle 3 */}
            <section className="group">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="shrink-0 p-4 bg-navy-500/10 rounded-2xl border border-navy-500/20 group-hover:bg-navy-500/20 transition-colors">
                        <Brain className="w-8 h-8 text-navy-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Learn in Public</h2>
                        <p className="text-gray-400 leading-loose text-lg">
                            Knowledge grows when shared. We document our failures, our fixes, and our "aha!" moments.
                            A public portfolio of <span className="text-navy-400 font-bold">12 capstone projects</span> is worth more than any multiple-choice certification.
                        </p>
                    </div>
                </div>
            </section>

            {/* Principle 4 */}
            <section className="group">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="shrink-0 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <Target className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Gamify the Grind</h2>
                        <p className="text-gray-400 leading-loose text-lg">
                            The dopamine hit from leveling up shouldn't be reserved for video games. 
                            We track XP, earn badges, and visualize progress to hack our brains into loving the difficult process of mastering distributed systems.
                        </p>
                    </div>
                </div>
            </section>
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 text-center">
            <p className="text-gray-500 mb-8 italic">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a 
                    href="https://github.com/savin2001/devops-learning-journey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Users className="w-4 h-4" /> Join the Community
                </a>
                <button 
                    onClick={onBack}
                    className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-colors"
                >
                    Start Your Quest
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Manifesto;
