
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
    <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[600px] relative">
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5 z-10 flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    Learning Roadmap
                </h3>
                <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mt-1">48-Week Sequence</p>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-mono">
                    {Object.keys(quizResults).filter(k => quizResults[Number(k)] >= 80).length} / {CURRICULUM_DATA.length} UNLOCKED
                </span>
            </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-10 scrollbar-hide relative z-0">
            {[1, 2, 3, 4].map(phaseId => (
                phases[phaseId] && (
                    <div key={phaseId} className="relative pl-6 border-l border-white/10 ml-2">
                        <span className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 border border-gray-700 text-[10px] font-bold text-gray-500 shadow-xl">
                            {phaseId}
                        </span>
                        
                        <h4 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2 pl-2">
                            {phaseTitles[phaseId]} <span className="text-gray-600 text-[10px] bg-gray-800 px-2 py-0.5 rounded-full">Phase</span>
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
                                                ? 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10 hover:shadow-lg hover:-translate-y-1' 
                                                : 'bg-black/10 border-transparent opacity-50 grayscale'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Icon State */}
                                            <div className="mt-1 shrink-0">
                                                {quizPassed ? (
                                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                    </div>
                                                ) : unlocked ? (
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 animate-pulse">
                                                        <Play className="w-4 h-4 text-blue-400 fill-blue-400" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                                        <Lock className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${unlocked ? 'bg-blue-900/20 text-blue-300 border-blue-500/20' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                                                                WEEK {week.id}
                                                            </span>
                                                            {week.projects && (
                                                                <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                                                                    PROJECT
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h5 className={`font-bold text-lg truncate ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                                                            {week.title}
                                                        </h5>
                                                    </div>

                                                    {/* Action Button */}
                                                    <button 
                                                        onClick={() => unlocked && setActiveQuiz({ topic: week.title, weekId: week.id })}
                                                        disabled={!unlocked}
                                                        className={`shrink-0 px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                                                            quizPassed 
                                                                ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' 
                                                                : unlocked 
                                                                    ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-lg shadow-blue-900/20' 
                                                                    : 'bg-transparent border-gray-700 text-gray-600 cursor-not-allowed'
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
                                                            <span key={i} className="text-[10px] text-gray-400 bg-black/30 px-2 py-1 rounded">
                                                                {topic}
                                                            </span>
                                                        ))}
                                                        {week.topics.length > 3 && <span className="text-[10px] text-gray-500 self-center">+{week.topics.length - 3} more</span>}
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
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent pointer-events-none rounded-b-3xl"></div>

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
