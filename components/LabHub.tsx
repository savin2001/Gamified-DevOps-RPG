
import React, { useState, useEffect } from 'react';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, saveLabCompletion, getLabSubmissions, saveLabSubmission, getStudySessionsForWeek } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Lock, Unlock, Beaker, CheckCircle2, Terminal, Eye, BookOpen } from 'lucide-react';
import SuccessModal from './SuccessModal';

interface LabHubProps {
  onActivityLogged: () => void;
}

const LabHub: React.FC<LabHubProps> = ({ onActivityLogged }) => {
  const [activeLabId, setActiveLabId] = useState<string | null>(null);
  const [completedLabs, setCompletedLabs] = useState<string[]>([]);
  const [output, setOutput] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setCompletedLabs(getCompletedLabs());
  }, []);

  // Load previous submission
  useEffect(() => {
    if (activeLabId) {
        const submissions = getLabSubmissions();
        if (submissions[activeLabId]) {
            setOutput(submissions[activeLabId]);
        } else {
            setOutput('');
        }
    }
  }, [activeLabId]);

  const handleCompleteLab = (labId: string, weekId: number) => {
    saveLabCompletion(labId);
    saveLabSubmission(labId, output);
    setCompletedLabs([...completedLabs, labId]);
    
    if (!completedLabs.includes(labId)) {
        const labKey = Number(labId.split('-')[1]); 
        logActivity(ActivityType.LAB_SESSION, `Completed Lab: ${LAB_DATA[labKey]?.title || labId}`, weekId);
        onActivityLogged();
        setShowSuccessModal(true); // Trigger gamification overlay
    }
    
    setActiveLabId(null);
    setOutput('');
  };

  const handleSaveProgress = (labId: string) => {
      saveLabSubmission(labId, output);
  };

  // Filter only Labs
  const labs = Object.values(LAB_DATA).filter(l => l.type === 'Lab');

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Beaker className="text-devops-accent" />
          Lab Center
        </h2>
        
        <button 
            onClick={() => setIsReviewMode(!isReviewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                isReviewMode 
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' 
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
            }`}
        >
            {isReviewMode ? (
                <>
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Review Mode (Unlocked)</span>
                </>
            ) : (
                <>
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">Learning Mode</span>
                </>
            )}
        </button>
      </div>

      {activeLabId ? (
        <div className="bg-devops-card rounded-xl border border-gray-700 p-6 animate-in fade-in slide-in-from-bottom-4">
           {(() => {
             const lab = Object.values(LAB_DATA).find(l => l.id === activeLabId);
             if (!lab) return null;
             
             const isPreviouslyCompleted = completedLabs.includes(lab.id);
             
             return (
                 <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white">{lab.title}</h3>
                            <p className="text-gray-400 text-sm">Week {lab.weekId} • {lab.duration} • {lab.difficulty}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    handleSaveProgress(lab.id);
                                    setActiveLabId(null);
                                }} 
                                className="text-gray-400 hover:text-white px-3 py-1 text-sm border border-transparent hover:border-gray-600 rounded"
                            >
                                Save & Exit
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                                <h4 className="font-bold text-blue-400 mb-2">Real-World Objectives</h4>
                                <ul className="list-disc list-inside text-sm text-gray-300">
                                    {lab.objectives.map((o, i) => <li key={i}>{o}</li>)}
                                </ul>
                            </div>
                            
                            <div className="space-y-4">
                                {lab.steps.map((step, i) => (
                                    <div key={i} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
                                        <h5 className="font-bold text-white mb-1">Step {i+1}: {step.title}</h5>
                                        <p className="text-sm text-gray-400 mb-2">{step.instruction}</p>
                                        {step.command && (
                                            <code className="block bg-black p-3 rounded text-green-400 font-mono text-sm border border-gray-700 mt-2 whitespace-pre-wrap">
                                                <span className="text-gray-500 select-none">$ </span>{step.command}
                                            </code>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 h-fit sticky top-6">
                            <div className="flex items-center gap-2 mb-4 text-gray-400">
                                <Terminal className="w-5 h-5" />
                                <span>Verification Console</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Execute the verification command in your terminal and paste the result here:</p>
                             {lab.verificationCommand && (
                                <div className="mb-4 text-xs font-mono bg-black p-2 rounded text-gray-400 border border-gray-800 break-all">
                                    $ {lab.verificationCommand}
                                </div>
                            )}
                            <textarea 
                                value={output}
                                onChange={(e) => setOutput(e.target.value)}
                                className="w-full bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-48 border border-gray-700 focus:border-green-500 focus:outline-none resize-none"
                                placeholder={`Expected output:\n${lab.expectedOutput || "..."}`}
                            />
                            <div className="mt-4 flex justify-end">
                                <button 
                                    onClick={() => handleCompleteLab(lab.id, lab.weekId)}
                                    disabled={output.length < 2}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> 
                                    {isPreviouslyCompleted ? 'Update Submission' : 'Verify & Complete'}
                                </button>
                            </div>
                        </div>
                    </div>
                 </div>
             );
           })()}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {labs.map((lab) => {
            const isCompleted = completedLabs.includes(lab.id);
            const sessionsCompleted = getStudySessionsForWeek(lab.weekId);
            
            // Logic: Unlocked if 2+ study sessions done for that week OR previously completed OR in review mode
            const isUnlocked = isReviewMode || sessionsCompleted >= 2 || isCompleted;
            
            return (
              <div 
                key={lab.id} 
                className={`rounded-xl border p-6 transition-all ${
                    !isUnlocked
                        ? 'bg-gray-900/50 border-gray-800 opacity-60'
                        : isCompleted 
                            ? 'bg-gray-900/30 border-green-900/50' 
                            : 'bg-devops-card border-gray-700 hover:border-devops-accent'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs px-2 py-1 rounded border ${
                        lab.difficulty === 'Beginner' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                        lab.difficulty === 'Intermediate' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                        lab.difficulty === 'Advanced' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                        'border-red-500/30 text-red-400 bg-red-500/10'
                    }`}>
                        {lab.difficulty}
                    </span>
                    {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : isUnlocked ? (
                        <Unlock className="w-5 h-5 text-gray-400" />
                    ) : (
                        <Lock className="w-5 h-5 text-gray-600" />
                    )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{lab.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">Week {lab.weekId} • {lab.duration}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                    {lab.objectives.slice(0, 3).map((obj, i) => (
                        <span key={i} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">
                            {obj}
                        </span>
                    ))}
                </div>

                {!isUnlocked && !isCompleted && (
                    <p className="text-xs text-red-400 mb-3 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Complete 2 study sessions in Week {lab.weekId} to unlock
                    </p>
                )}

                <button
                    onClick={() => setActiveLabId(lab.id)}
                    disabled={!isUnlocked}
                    className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                        !isUnlocked ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                        isCompleted ? 'bg-green-900/20 text-green-400 border border-green-900/50 hover:bg-green-900/40' :
                        'bg-devops-accent text-white hover:bg-blue-600'
                    }`}
                >
                    {isCompleted ? 'Review Submission' : !isUnlocked ? 'Locked' : 'Start Lab'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        xpEarned={100}
        title="Lab Completed!"
        message="Excellent work applying your knowledge. You're one step closer to mastery."
      />
    </div>
  );
};

export default LabHub;
