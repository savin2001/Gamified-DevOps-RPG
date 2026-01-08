import React, { useMemo } from 'react';
import { CURRICULUM_DATA } from '../constants';
import { CheckCircle2, Circle } from 'lucide-react';
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
    1: "Phase 1: Foundation (Weeks 1-12)",
    2: "Phase 2: Intermediate Skills (Weeks 13-28)",
    3: "Phase 3: Advanced Operations (Weeks 29-40)",
    4: "Phase 4: Professional Mastery (Weeks 41-48)"
  };

  return (
    <div className="bg-devops-card rounded-xl border border-gray-700 shadow-lg overflow-hidden flex flex-col h-[600px]">
        <div className="p-6 border-b border-gray-700 bg-devops-card z-10">
            <h3 className="text-xl font-bold text-white">Learning Roadmap</h3>
            <p className="text-gray-400 text-sm mt-1">Track your 48-week journey to DevOps mastery</p>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4 space-y-6">
            {[1, 2, 3, 4].map(phaseId => (
                phases[phaseId] && (
                    <div key={phaseId} className="space-y-3">
                        <h4 className="text-devops-accent font-bold text-lg sticky top-0 bg-devops-card py-2 border-b border-gray-800/50 z-0 pl-1">
                            {phaseTitles[phaseId]}
                        </h4>
                        <div className="space-y-3">
                            {phases[phaseId].map((week) => (
                                <div key={week.id} className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/60 transition-colors border border-gray-800 hover:border-gray-600 group">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {week.isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-500 group-hover:text-devops-accent" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap justify-between items-start gap-2">
                                                <h5 className="text-white font-medium">Week {week.id}: {week.title}</h5>
                                                {week.projects && (
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 whitespace-nowrap">
                                                        Project
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">{week.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {week.topics.map((topic, i) => (
                                                    <span key={i} className="text-xs bg-gray-900 text-gray-300 px-2 py-1 rounded border border-gray-700">
                                                        {topic}
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
    </div>
  );
};

export default CurriculumView;
