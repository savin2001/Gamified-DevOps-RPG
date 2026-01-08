import React, { useMemo } from 'react';
import { X, Zap, Brain, CheckCircle2, Trophy, Flame, Target, Star } from 'lucide-react';

// Helper icons
const RocketIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
);
const ShieldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  xpEarned: number;
  score?: number; // 0 to 100
  title?: string;
  message?: string;
}

interface FeedbackMessage {
  min: number;
  max: number;
  title: string;
  message: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  animation: string;
}

// Local Bank of Messages (30+ variations) to remove LLM reliance
const MESSAGE_BANK: FeedbackMessage[] = [
  // --- GOD MODE (95-100) ---
  { min: 95, max: 100, title: "GOD MODE ACTIVATED! ⚡", message: "You are absolutely crushing it! This is the kind of session that builds careers. Unstoppable force!", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/20", animation: "animate-bounce" },
  { min: 95, max: 100, title: "LEGENDARY STATUS 🏆", message: "Perfection. Energy, confidence, and focus are aligned. Enjoy this feeling!", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/20", animation: "animate-pulse" },
  { min: 95, max: 100, title: "DEVOPS MASTER 👑", message: "You ate that session for breakfast. The cloud bows down to your CLI skills today.", icon: Flame, color: "text-red-500", bg: "bg-red-500/20", animation: "animate-pulse" },

  // --- HIGH PERFORMANCE (80-94) ---
  { min: 80, max: 94, title: "In The Zone! 🔥", message: "You're building serious momentum. Great energy and high confidence is a winning combo.", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/20", animation: "animate-pulse" },
  { min: 80, max: 94, title: "Firing on All Cylinders 🚀", message: "Excellent work today. You tackled complex topics with a clear mind. Keep pushing!", icon: RocketIcon, color: "text-blue-400", bg: "bg-blue-500/20", animation: "animate-bounce" },
  { min: 80, max: 94, title: "High Voltage Learning ⚡", message: "Your brain is absorbing everything. Make sure to rest as hard as you studied!", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/20", animation: "animate-pulse" },
  { min: 80, max: 94, title: "Level Up Imminent ⬆️", message: "Consistency plus high energy equals massive gains. You're getting closer to mastery.", icon: Trophy, color: "text-green-400", bg: "bg-green-500/20", animation: "animate-bounce" },
  { min: 80, max: 94, title: "Code Warrior ⚔️", message: "You fought the bugs and the docs, and you won. Victory is sweet.", icon: Target, color: "text-purple-400", bg: "bg-purple-500/20", animation: "animate-pulse" },

  // --- SOLID / GOOD (60-79) ---
  { min: 60, max: 79, title: "Solid Session ✅", message: "Good honest work. These are the sessions that build the foundation of your knowledge.", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20", animation: "animate-none" },
  { min: 60, max: 79, title: "Steady Progress 📈", message: "You showed up and put in the work. That's 90% of the battle. Well done.", icon: Target, color: "text-blue-400", bg: "bg-blue-500/20", animation: "animate-none" },
  { min: 60, max: 79, title: "Brick by Brick 🧱", message: "Rome wasn't built in a day, and neither is a DevOps career. Another brick laid perfectly.", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/20", animation: "animate-none" },
  { min: 60, max: 79, title: "Knowledge Locked In 🔒", message: "You might not feel like a genius today, but you're smarter than you were yesterday.", icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/20", animation: "animate-none" },
  { min: 60, max: 79, title: "On The Right Path 🗺️", message: "Consistency beats intensity. You're moving forward, and that's what counts.", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20", animation: "animate-none" },

  // --- GRIND / DISCIPLINE (40-59) ---
  { min: 40, max: 59, title: "Discipline Wins 🛡️", message: "Motivation was low, but you did it anyway. That is the definition of a professional.", icon: ShieldIcon, color: "text-blue-400", bg: "bg-blue-500/20", animation: "animate-none" },
  { min: 40, max: 59, title: "Respect The Grind ✊", message: "Not every day is a highlight reel. You put in the reps. Respect.", icon: Target, color: "text-gray-400", bg: "bg-gray-500/20", animation: "animate-none" },
  { min: 40, max: 59, title: "Embrace the Suck 🌪️", message: "Learning is hard. Confusion is part of the process. You survived, good job.", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/20", animation: "animate-none" },
  { min: 40, max: 59, title: "Still Standing 🥊", message: "DevOps threw some punches today, but you didn't quit. Rest up and attack tomorrow.", icon: Star, color: "text-red-400", bg: "bg-red-500/20", animation: "animate-none" },

  // --- STRUGGLE / RESILIENCE (0-39) ---
  { min: 0, max: 39, title: "Resilience Badge 🏅", message: "You were tired/overwhelmed, but you didn't break the streak. That takes guts.", icon: ShieldIcon, color: "text-yellow-600", bg: "bg-yellow-900/20", animation: "animate-none" },
  { min: 0, max: 39, title: "Survival Mode 🏕️", message: "Sometimes the only goal is to show up. You did that. Be proud of the effort.", icon: Flame, color: "text-orange-400", bg: "bg-orange-900/20", animation: "animate-none" },
  { min: 0, max: 39, title: "Rest Needed 🛌", message: "Great job pushing through, but don't burn out. Prioritize sleep tonight.", icon: Brain, color: "text-blue-400", bg: "bg-blue-900/20", animation: "animate-none" },
  { min: 0, max: 39, title: "Hard Day, Strong Mind 🧠", message: "Growth happens in the struggle. Today was hard so tomorrow can be easier.", icon: Brain, color: "text-gray-400", bg: "bg-gray-800", animation: "animate-none" },
];

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  xpEarned, 
  score = 100,
  title,
  message
}) => {
  if (!isOpen) return null;

  // Select a message based on score
  const config = useMemo(() => {
    // If custom title/message provided (e.g. from Lab/Project completion)
    if (title && message) {
        return {
            title,
            message,
            icon: Trophy,
            color: "text-yellow-400",
            bg: "bg-yellow-500/20",
            animation: "animate-bounce",
            // Dummy values for type safety if needed, though unused in this branch
            min: 0, 
            max: 100
        };
    }

    // Filter messages that fit the score range
    const candidates = MESSAGE_BANK.filter(m => score >= m.min && score <= m.max);
    // Fallback if ranges handle weirdly (shouldn't happen)
    if (candidates.length === 0) return MESSAGE_BANK[MESSAGE_BANK.length - 1]; // Return a low one by default
    
    // Pick random from candidates to vary experience
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }, [score, isOpen, title, message]); // Recalculate only when opening or props change

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-devops-card border border-gray-600 rounded-2xl p-8 max-w-md w-full text-center relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {(score >= 80 || title) && (
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://media.giphy.com/media/26tOZ42Mg6pbTUPvy/giphy.gif')] bg-cover bg-center"></div>
            )}
            
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-6 relative z-10">
                <div className={`${config.bg} p-4 rounded-full ring-4 ring-white/5`}>
                    <Icon className={`w-12 h-12 ${config.color} ${config.animation}`} />
                </div>
            </div>

            <div className="relative z-10">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 border ${config.color.replace('text', 'border')} ${config.bg}`}>
                    Session Score: {Math.round(score)}%
                </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                {config.title}
            </h3>

            <p className="text-gray-300 mb-6 leading-relaxed relative z-10">
                {config.message}
            </p>

            <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 mb-6 flex justify-around text-sm relative z-10 border border-gray-700">
                <div className="text-center">
                    <div className="text-devops-accent font-bold text-lg">+{xpEarned}</div>
                    <div className="text-gray-500 text-xs uppercase">XP Earned</div>
                </div>
                <div className="text-center">
                    <div className="text-green-400 font-bold text-lg">Saved</div>
                    <div className="text-gray-500 text-xs uppercase">Progress</div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full bg-devops-accent hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] relative z-10 shadow-lg shadow-blue-900/20"
            >
                Continue Journey
            </button>
        </div>
    </div>
  );
};

export default SuccessModal;