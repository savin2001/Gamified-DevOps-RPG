
import React, { useState, useEffect } from 'react';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, saveLabCompletion, getLabSubmissions, saveLabSubmission, getStudySessionsForWeek } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Lock, Unlock, Beaker, CheckCircle2, Terminal, Eye, BookOpen, AlertCircle, Play, Save, History } from 'lucide-react';
import SuccessModal from './SuccessModal';

interface LabHubProps {
  onActivityLogged: () => void;
}

const LabHub: React.FC<LabHubProps> = ({ onActivityLogged }) => {
  const [activeLabId, setActiveLabId] = useState<string | null>(null);
  const [completedLabs, setCompletedLabs] = useState<string[]>([]);
  const [savedSubmissions, setSavedSubmissions] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setCompletedLabs(getCompletedLabs());
    setSavedSubmissions(getLabSubmissions());
  }, []);

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
    if (isReviewMode) return; // Prevention check

    saveLabCompletion(labId);
    saveLabSubmission(labId, output);
    
    // Update local state
    const newCompleted = [...completedLabs, labId];
    setCompletedLabs(newCompleted);
    setSavedSubmissions(prev => ({...prev, [labId]: output}));
    
    if (!completedLabs.includes(labId)) {
        const labKey = Number(labId.split('-')[1]); 
        logActivity(ActivityType.LAB_SESSION, `Completed Lab: ${LAB_DATA[labKey]?.title || labId}`, weekId);
        onActivityLogged();
        setShowSuccessModal(true); 
    }
    
    setActiveLabId(null);
    setOutput('');
  };

  const handleSaveDraft = (labId: string) => {
      if (isReviewMode) return;
      saveLabSubmission(labId, output);
      setSavedSubmissions(prev => ({...prev, [labId]: output}));
      setActiveLabId(null);
  };

  const labs = Object.values(LAB_DATA).filter(l => l.type === 'Lab');

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-green-500/20 to-teal-500/10 rounded-xl border border-white/10">
                    <Beaker className="text-green-400 w-6 h-6" />
                </span>
                Lab Center
            </h2>
            <p className="text-gray-400 mt-1 ml-1 text-sm">Simulated environments for practical application.</p>
        </div>
        
        <button 
            onClick={() => setIsReviewMode(!isReviewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                isReviewMode 
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
        >
            {isReviewMode ? (
                <>
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Review Mode</span>
                </>
            ) : (
                <>
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Student Mode</span>
                </>
            )}
        </button>
      </div>

      {activeLabId ? (
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
           {(() => {
             const lab = Object.values(LAB_DATA).find(l => l.id === activeLabId);
             if (!lab) return null;
             
             const isPreviouslyCompleted = completedLabs.includes(lab.id);
             
             return (
                 <div className="flex flex-col h-[800px] lg:h-[600px] lg:flex-row">
                    {/* Sidebar / Instructions */}
                    <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col bg-gray-900/50">
                        <div className={`p-6 border-b border-white/10 ${isReviewMode ? 'bg-yellow-500/5' : ''}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">LAB-{lab.weekId}</span>
                                {isReviewMode && <span className="text-[10px] font-bold text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded bg-yellow-500/10">READ ONLY</span>}
                            </div>
                            <h3 className="text-xl font-bold text-white leading-tight">{lab.title}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                             <div>
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Objectives</h4>
                                <ul className="space-y-2">
                                    {lab.objectives.map((o, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-300">
                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-blue-500"></div>
                                            {o}
                                        </li>
                                    ))}
                                </ul>
                             </div>
                             
                             <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Protocol</h4>
                                {lab.steps.map((step, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-white/10 pb-4 last:pb-0">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-700"></div>
                                        <h5 className="text-sm font-bold text-white mb-1">{step.title}</h5>
                                        <p className="text-xs text-gray-400 leading-relaxed mb-2">{step.instruction}</p>
                                        {step.command && (
                                            <code className="block bg-black/50 p-2 rounded text-[10px] font-mono text-green-300 border border-white/5 break-all">
                                                {step.command}
                                            </code>
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-black/20">
                            <button 
                                onClick={() => { 
                                    if (!isReviewMode) handleSaveDraft(lab.id); 
                                    else setActiveLabId(null);
                                }} 
                                className="w-full text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                {isReviewMode ? '← Return to Hub' : '← Save Draft & Return'}
                            </button>
                        </div>
                    </div>

                    {/* Main / Terminal */}
                    <div className="lg:w-2/3 flex flex-col bg-[#0c0c0c] relative">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                         
                         <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5">
                             <div className="flex gap-2">
                                 <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                 <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                 <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                             </div>
                             <div className="text-[10px] font-mono text-gray-500 flex items-center gap-2">
                                 <Terminal className="w-3 h-3" /> bash — 80x24 {isReviewMode && '(LOCKED)'}
                             </div>
                         </div>

                         <div className="flex-1 p-6 font-mono text-sm overflow-hidden flex flex-col">
                             <div className="text-gray-500 mb-4">
                                 Welcome to DevOps Quest Terminal v2.0<br/>
                                 Last login: {new Date().toTimeString()}<br/>
                                 {isReviewMode ? 'System Status: READ_ONLY_MOUNT' : 'Type verification command to complete lab...'}
                             </div>
                             
                             <div className={`flex-1 bg-black/50 border ${isReviewMode ? 'border-yellow-500/10' : 'border-white/10'} rounded-lg p-4 relative overflow-hidden`}>
                                 <div className="absolute top-2 right-2 text-[10px] text-gray-600">INPUT STREAM</div>
                                 <textarea 
                                    readOnly={isReviewMode}
                                    value={output}
                                    onChange={(e) => setOutput(e.target.value)}
                                    className={`w-full h-full bg-transparent ${isReviewMode ? 'text-gray-500 cursor-not-allowed' : 'text-green-400'} focus:outline-none resize-none`}
                                    placeholder={isReviewMode ? "Terminal input disabled in Review Mode." : `$ ${lab.verificationCommand || "verify_lab"}\n\n// Paste expected output here:\n// ${lab.expectedOutput || "..."}`}
                                    autoFocus={!isReviewMode}
                                 />
                             </div>
                         </div>

                         <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center gap-4">
                             <div className="flex items-center gap-3">
                                 <span className={`text-xs ${output.length > 2 ? 'text-green-500' : 'text-gray-600'}`}>
                                     {output.length > 2 ? '● Signal Verified' : '○ Waiting for Input'}
                                 </span>
                             </div>

                             <div className="flex gap-3">
                                {isReviewMode ? (
                                    <div className="px-4 py-3 rounded-lg border border-yellow-500/20 text-yellow-500 text-xs font-bold bg-yellow-500/5 flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> READ ONLY PREVIEW
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleSaveDraft(lab.id)}
                                            className="px-4 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> Save Draft
                                        </button>
                                        <button 
                                            onClick={() => handleCompleteLab(lab.id, lab.weekId)}
                                            disabled={output.length < 2}
                                            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:grayscale text-black font-bold px-6 py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> 
                                            {isPreviouslyCompleted ? 'Update Verification' : 'Execute & Complete'}
                                        </button>
                                    </>
                                )}
                             </div>
                         </div>
                    </div>
                 </div>
             );
           })()}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => {
            const isCompleted = completedLabs.includes(lab.id);
            const isInProgress = !isCompleted && savedSubmissions[lab.id] && savedSubmissions[lab.id].length > 0;
            const sessionsCompleted = getStudySessionsForWeek(lab.weekId);
            const isUnlocked = sessionsCompleted >= 2 || isCompleted;
            
            // In Review Mode, everything is accessible but read-only.
            // In Normal Mode, you must unlock it.
            const canEnter = isReviewMode || isUnlocked || isInProgress;
            
            return (
              <div 
                key={lab.id} 
                className={`group relative rounded-3xl p-6 border transition-all duration-300 overflow-hidden ${
                    !canEnter && !isReviewMode
                        ? 'bg-gray-900/20 border-white/5 opacity-60 grayscale'
                        : isCompleted 
                            ? 'bg-green-900/10 border-green-500/30' 
                            : isInProgress
                                ? 'bg-blue-900/10 border-blue-500/30'
                                : 'bg-gray-900/40 border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                }`}
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                             lab.difficulty === 'Beginner' ? 'text-green-400 border-green-500/20 bg-green-500/10' :
                             lab.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' :
                             'text-red-400 border-red-500/20 bg-red-500/10'
                        }`}>
                            {lab.difficulty}
                        </div>
                        {isCompleted ? (
                            <div className="p-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                                <CheckCircle2 className="w-4 h-4 text-black" />
                            </div>
                        ) : isInProgress ? (
                            <div className="p-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                                <History className="w-4 h-4 text-white" />
                            </div>
                        ) : isUnlocked ? (
                            <div className="p-1.5 bg-blue-500/20 rounded-full border border-blue-500/50">
                                <Unlock className="w-4 h-4 text-blue-400" />
                            </div>
                        ) : (
                            <Lock className="w-5 h-5 text-gray-700" />
                        )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-200 transition-colors">{lab.title}</h3>
                    <p className="text-xs font-mono text-gray-500 mb-6">WK-{String(lab.weekId).padStart(2,'0')} // EST: {lab.duration.toUpperCase()}</p>

                    {!isUnlocked && !isCompleted && !isInProgress && !isReviewMode && (
                        <div className="flex items-center gap-2 text-[10px] text-red-400 bg-red-500/5 p-2 rounded border border-red-500/10 mb-4">
                            <AlertCircle className="w-3 h-3" />
                            <span>REQ: 2 Study Sessions</span>
                        </div>
                    )}

                    <button
                        onClick={() => setActiveLabId(lab.id)}
                        disabled={!canEnter}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            !canEnter ? 'bg-white/5 text-gray-600 cursor-not-allowed' :
                            isReviewMode ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' :
                            isCompleted ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                            isInProgress ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg' :
                            'bg-white text-black hover:bg-blue-50 shadow-lg shadow-white/10'
                        }`}
                    >
                        {isReviewMode ? 'Preview (Read Only)' : 
                         isCompleted ? 'Review Submission' : 
                         isInProgress ? 'Resume Lab' :
                         !canEnter ? 'Access Denied' : 
                         <>Initialize <Play className="w-3 h-3 fill-current" /></>}
                    </button>
                </div>
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
