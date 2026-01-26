
import React, { useMemo, useState, useEffect } from 'react';
import { CURRICULUM_DATA } from '../constants';
import { CheckCircle2, Circle, Lock, Brain, Trophy, Play } from 'lucide-react';
import { CurriculumWeek } from '../types';
import QuizModal from './QuizModal';
import { getQuizResults } from '../services/gamificationService';

const CurriculumView: React.FC = () => {
  const [activeQuiz, setActiveQuiz] = useState<{topic: string, weekId: number} | null>(null);
  const [quizResults, setQuizResults] = useState<Record<number, number>>({});

  useEffect(() => {
      setQuizResults(getQuizResults());
  }, [activeQuiz]); 

  const phases = useMemo(() => {
    const grouped: Record<number, CurriculumWeek[]> = {};
    CURRICULUM_DATA.forEach(week => {
      if (!grouped[week.phase]) grouped[week.phase] = [];
      grouped[week.phase].push(week);
    });
    return grouped;
  }, []);

  const phaseTitles: Record<number, string> = {
    1: "Foundation",
    2: "Intermediate",
    3: "Advanced",
    4: "Mastery"
  };

  const isWeekUnlocked = (weekId: number) => {
      if (weekId === 1) return true;
      const prevWeekScore = quizResults[weekId - 1] || 0;
      return prevWeekScore >= 80;
  };

  return (
    <div className="bg-white dark:bg-surface-cardDark backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col h-[600px] relative shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 z-10 flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-navy-600 dark:text-navy-400" />
                    Learning Roadmap
                </h3>
                <p className="text-slate-500 dark:text-gray-400 text-xs font-mono uppercase tracking-wider mt-1">48-Week Sequence</p>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-gray-500 font-mono">
                    {Object.keys(quizResults).filter(k => quizResults[Number(k)] >= 80).length} / {CURRICULUM_DATA.length} UNLOCKED
                </span>
            </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-10 scrollbar-hide relative z-0">
            {[1, 2, 3, 4].map(phaseId => (
                phases[phaseId] && (
                    <div key={phaseId} className="relative pl-6 border-l border-slate-200 dark:border-white/10 ml-2">
                        <span className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 text-[10px] font-bold text-slate-500 dark:text-gray-500 shadow-sm">
                            {phaseId}
                        </span>
                        
                        <h4 className="text-navy-600 dark:text-navy-400 font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2 pl-2">
                            {phaseTitles[phaseId]} <span className="text-slate-500 dark:text-gray-600 text-[10px] bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Phase</span>
                        </h4>
                        
                        <div className="space-y-4">
                            {phases[phaseId].map((week) => {
                                const quizPassed = (quizResults[week.id] || 0) >= 80;
                                const unlocked = isWeekUnlocked(week.id);
                                
                                return (
                                    <div 
                                        key={week.id} 
                                        className={`group relative rounded-2xl p-5 border transition-all duration-300 ${
                                            unlocked 
                                                ? 'bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-md dark:hover:shadow-lg hover:-translate-y-1' 
                                                : 'bg-slate-50 dark:bg-black/10 border-transparent opacity-50 grayscale'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Icon State */}
                                            <div className="mt-1 shrink-0">
                                                {quizPassed ? (
                                                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center border border-brand-200 dark:border-brand-500/30 shadow-sm">
                                                        <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                                    </div>
                                                ) : unlocked ? (
                                                    <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-500/20 flex items-center justify-center border border-navy-200 dark:border-navy-500/30 animate-pulse">
                                                        <Play className="w-4 h-4 text-navy-600 dark:text-navy-400 fill-current" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center border border-slate-300 dark:border-gray-700">
                                                        <Lock className="w-4 h-4 text-slate-500 dark:text-gray-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${unlocked ? 'bg-navy-50 dark:bg-navy-900/20 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-500/20' : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-500 border-slate-200 dark:border-gray-700'}`}>
                                                                WEEK {week.id}
                                                            </span>
                                                            {week.projects && (
                                                                <span className="text-[10px] bg-gold-100 dark:bg-gold-500/10 text-gold-700 dark:text-gold-300 px-2 py-0.5 rounded border border-gold-200 dark:border-gold-500/20">
                                                                    PROJECT
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h5 className={`font-bold text-lg truncate ${unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-500'}`}>
                                                            {week.title}
                                                        </h5>
                                                    </div>

                                                    {/* Action Button */}
                                                    <button 
                                                        onClick={() => unlocked && setActiveQuiz({ topic: week.title, weekId: week.id })}
                                                        disabled={!unlocked}
                                                        className={`shrink-0 px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                                                            quizPassed 
                                                                ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20' 
                                                                : unlocked 
                                                                    ? 'bg-navy-600 text-white border-navy-500 hover:bg-navy-500 shadow-md' 
                                                                    : 'bg-transparent border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-600 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {quizPassed ? (
                                                            <>PASSED <Trophy className="w-3 h-3" /></>
                                                        ) : unlocked ? (
                                                            <>START QUIZ <Brain className="w-3 h-3" /></>
                                                        ) : (
                                                            <>LOCKED <Lock className="w-3 h-3" /></>
                                                        )}
                                                    </button>
                                                </div>
                                                
                                                {/* Topics Preview (Only if unlocked) */}
                                                {unlocked && (
                                                    <div className="flex flex-wrap gap-2 mt-3 opacity-60">
                                                        {week.topics.slice(0, 3).map((topic, i) => (
                                                            <span key={i} className="text-[10px] text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-black/30 px-2 py-1 rounded">
                                                                {topic}
                                                            </span>
                                                        ))}
                                                        {week.topics.length > 3 && <span className="text-[10px] text-slate-500 dark:text-gray-500 self-center">+{week.topics.length - 3} more</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            ))}
        </div>
        
        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-[#0f172a] via-white/80 dark:via-[#0f172a]/80 to-transparent pointer-events-none rounded-b-3xl"></div>

        {/* Quiz Modal */}
        {activeQuiz && (
            <QuizModal 
                isOpen={!!activeQuiz}
                onClose={() => setActiveQuiz(null)}
                topic={activeQuiz.topic}
                weekId={activeQuiz.weekId}
                onComplete={() => {
                    setQuizResults(getQuizResults()); 
                }}
            />
        )}
    </div>
  );
};

export default CurriculumView;
