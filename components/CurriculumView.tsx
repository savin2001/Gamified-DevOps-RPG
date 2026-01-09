
import React, { useMemo } from 'react';
import { CURRICULUM_DATA } from '../constants';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { CurriculumWeek } from '../types';

const CurriculumView: React.FC = () => {
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

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[600px] relative">
        <div className="p-6 border-b border-white/5 bg-white/5 z-10 flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold text-white">Learning Roadmap</h3>
                <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mt-1">48-Week Sequence</p>
            </div>
            <div className="h-2 w-24 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/4"></div>
            </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-6 space-y-8 scrollbar-hide">
            {[1, 2, 3, 4].map(phaseId => (
                phases[phaseId] && (
                    <div key={phaseId} className="relative pl-6 border-l border-white/10">
                        <span className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 border border-gray-700 text-[10px] font-bold text-gray-500">
                            {phaseId}
                        </span>
                        
                        <h4 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                            {phaseTitles[phaseId]} <span className="text-gray-600 text-[10px]">Phase</span>
                        </h4>
                        
                        <div className="space-y-3">
                            {phases[phaseId].map((week) => (
                                <div key={week.id} className="group relative bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-all hover:translate-x-1">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {week.isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : week.id === 1 ? (
                                                <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                </div>
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-700 group-hover:text-gray-500 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap justify-between items-start gap-2">
                                                <h5 className={`font-medium ${week.isCompleted || week.id === 1 ? 'text-white' : 'text-gray-500'}`}>Week {week.id}: {week.title}</h5>
                                                {week.projects && (
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                                                        PROJECT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {week.topics.slice(0, 3).map((topic, i) => (
                                                    <span key={i} className="text-[10px] text-gray-400">
                                                        • {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}
        </div>
        
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default CurriculumView;
