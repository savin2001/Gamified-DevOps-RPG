
import React, { useState, useEffect, useRef } from 'react';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, saveLabCompletion, getLabSubmissions, saveLabSubmission, getStudySessionsForWeek } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Lock, Unlock, Beaker, CheckCircle2, Terminal, Eye, BookOpen, AlertCircle, Play, Save, History, Loader2, XCircle } from 'lucide-react';
import SuccessModal from './SuccessModal';
import FocusTimer, { FocusTimerHandle } from './FocusTimer';

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
  const [isExecuting, setIsExecuting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const timerRef = useRef<FocusTimerHandle>(null);

  useEffect(() => {
    setCompletedLabs(getCompletedLabs());
    setSavedSubmissions(getLabSubmissions());
  }, []);

  useEffect(() => {
    if (activeLabId) {
        timerRef.current?.reset();
        timerRef.current?.start();
        setValidationError(null); // Clear errors on new lab open
    } else {
        timerRef.current?.pause();
    }
  }, [activeLabId]);

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

  const handleCompleteLab = async (labId: string, weekId: number) => {
    if (isReviewMode) return;
    
    setIsExecuting(true);
    setValidationError(null);

    // Find the lab definition
    const lab = Object.values(LAB_DATA).find(l => l.id === labId);
    
    // Simulate Verification Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (lab) {
        const expected = (lab.expectedOutput || '').toLowerCase();
        const userOutput = output.toLowerCase();

        // Validation Logic: Check if output contains expected string
        if (!userOutput.includes(expected)) {
            setValidationError(`Verification Failed: Output mismatch.\nExpected to find: "${lab.expectedOutput}"`);
            setIsExecuting(false);
            return;
        }
    }

    saveLabCompletion(labId);
    saveLabSubmission(labId, output);
    
    const newCompleted = [...completedLabs, labId];
    setCompletedLabs(newCompleted);
    setSavedSubmissions(prev => ({...prev, [labId]: output}));
    
    if (!completedLabs.includes(labId)) {
        const labKey = Number(labId.split('-')[1]); 
        logActivity(ActivityType.LAB_SESSION, `Completed Lab: ${LAB_DATA[labKey]?.title || labId}`, weekId);
        onActivityLogged();
        setShowSuccessModal(true); 
    }
    
    setIsExecuting(false);
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
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
                    <Beaker className="text-brand-600 dark:text-brand-400 w-6 h-6" />
                </span>
                Lab Center
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mt-1 ml-1 text-sm">Simulated environments for practical application.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <FocusTimer 
                ref={timerRef}
                initialMinutes={90} 
                enablePomodoro={false} 
            />
            <button 
                onClick={() => setIsReviewMode(!isReviewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    isReviewMode 
                    ? 'bg-gold-50 dark:bg-gold-900/20 border-gold-200 dark:border-gold-800 text-gold-700 dark:text-gold-400' 
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'
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
      </div>

      {activeLabId ? (
        <div className="bg-white dark:bg-surface-cardDark rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-8">
           {(() => {
             const lab = Object.values(LAB_DATA).find(l => l.id === activeLabId);
             if (!lab) return null;
             
             const isPreviouslyCompleted = completedLabs.includes(lab.id);
             
             return (
                 <div className="flex flex-col h-[800px] lg:h-[600px] lg:flex-row">
                    {/* Sidebar / Instructions */}
                    <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50 dark:bg-black/5">
                        <div className={`p-6 border-b border-slate-200 dark:border-white/10 ${isReviewMode ? 'bg-gold-50 dark:bg-gold-900/10' : ''}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">LAB-{lab.weekId}</span>
                                {isReviewMode && <span className="text-[10px] font-bold text-gold-600 border border-gold-200 px-2 py-0.5 rounded bg-gold-50">READ ONLY</span>}
                            </div>
                            <h3 className="text-xl font-bold text-navy-900 dark:text-white leading-tight">{lab.title}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                             <div>
                                <h4 className="text-xs font-bold text-navy-600 dark:text-navy-400 uppercase tracking-wider mb-3">Objectives</h4>
                                <ul className="space-y-2">
                                    {lab.objectives.map((o, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-gray-300">
                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-navy-500"></div>
                                            {o}
                                        </li>
                                    ))}
                                </ul>
                             </div>
                             
                             <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Protocol</h4>
                                {lab.steps.map((step, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-slate-200 dark:border-white/10 pb-4 last:pb-0">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300 dark:bg-gray-600"></div>
                                        <h5 className="text-sm font-bold text-navy-900 dark:text-white mb-1">{step.title}</h5>
                                        <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-2">{step.instruction}</p>
                                        {step.command && (
                                            <code className="block bg-slate-100 dark:bg-black/30 p-2 rounded text-[10px] font-mono text-brand-700 dark:text-brand-300 border border-slate-200 dark:border-white/5 break-all">
                                                {step.command}
                                            </code>
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-surface-cardDark">
                            <button 
                                onClick={() => { 
                                    if (!isReviewMode) handleSaveDraft(lab.id); 
                                    else setActiveLabId(null);
                                }} 
                                disabled={isExecuting}
                                className="w-full text-xs text-slate-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                {isReviewMode ? '← Return to Hub' : '← Save Draft & Return'}
                            </button>
                        </div>
                    </div>

                    {/* Main / Terminal */}
                    <div className="lg:w-2/3 flex flex-col bg-[#18181b] relative"> {/* Zinc 900 - Terminal Background */}
                         <div className="flex items-center justify-between p-3 bg-zinc-900 border-b border-white/5">
                             <div className="flex gap-2">
                                 <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                 <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                 <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                             </div>
                             <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                                 <Terminal className="w-3 h-3" /> bash — 80x24 {isReviewMode && '(LOCKED)'}
                             </div>
                         </div>

                         <div className="flex-1 p-6 font-mono text-sm overflow-hidden flex flex-col text-slate-300">
                             <div className="mb-4 text-slate-400">
                                 # DevOps Quest Terminal v2.0<br/>
                                 # Status: {isExecuting ? 'VERIFYING...' : isReviewMode ? 'READ_ONLY_MOUNT' : 'Awaiting Input'}
                             </div>
                             
                             <div className={`flex-1 bg-black/30 border ${validationError ? 'border-red-500/30' : 'border-white/5'} rounded-lg p-4 relative overflow-hidden flex flex-col`}>
                                 <textarea 
                                    readOnly={isReviewMode || isExecuting}
                                    value={output}
                                    onChange={(e) => {
                                        setOutput(e.target.value);
                                        if (validationError) setValidationError(null);
                                    }}
                                    className={`w-full h-full bg-transparent ${isReviewMode ? 'text-slate-500 cursor-not-allowed' : 'text-brand-400'} focus:outline-none resize-none font-mono disabled:opacity-50`}
                                    placeholder={isReviewMode ? "Terminal input disabled in Review Mode." : `$ ${lab.verificationCommand || "verify_lab"}\n\n# Paste expected output here:\n# ${lab.expectedOutput || "..."}`}
                                    autoFocus={!isReviewMode}
                                 />
                                 {isExecuting && (
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                                         <div className="flex items-center gap-2 text-brand-400">
                                             <Loader2 className="w-5 h-5 animate-spin" />
                                             <span>Verifying Output Signature...</span>
                                         </div>
                                     </div>
                                 )}
                             </div>
                             
                             {validationError && (
                                 <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded text-xs animate-in slide-in-from-top-1">
                                     <div className="flex items-center gap-2 font-bold mb-1">
                                         <XCircle className="w-3 h-3" /> Error
                                     </div>
                                     <pre className="whitespace-pre-wrap font-mono">{validationError}</pre>
                                 </div>
                             )}
                         </div>

                         <div className="p-6 border-t border-white/10 bg-zinc-900 flex justify-between items-center gap-4">
                             <div className="flex items-center gap-3">
                                 <span className={`text-xs ${output.length > 2 ? 'text-brand-400' : 'text-slate-500'}`}>
                                     {output.length > 2 ? '● Output Detected' : '○ Idle'}
                                 </span>
                             </div>

                             <div className="flex gap-3">
                                {isReviewMode ? (
                                    <div className="px-4 py-3 rounded-lg border border-gold-500/30 text-gold-400 text-xs font-bold bg-gold-500/10 flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> READ ONLY
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleSaveDraft(lab.id)}
                                            disabled={isExecuting}
                                            className="px-4 py-3 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" /> Save
                                        </button>
                                        <button 
                                            onClick={() => handleCompleteLab(lab.id, lab.weekId)}
                                            disabled={output.length < 2 || isExecuting}
                                            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:grayscale text-white font-bold px-6 py-3 rounded-lg transition-all shadow-md flex items-center gap-2"
                                        >
                                            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            {isExecuting ? 'Verifying...' : isPreviouslyCompleted ? 'Update Verification' : 'Execute'}
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
            const canEnter = isReviewMode || isUnlocked || isInProgress;
            
            return (
              <div 
                key={lab.id} 
                className={`group relative rounded-xl p-6 border transition-all duration-200 ${
                    !canEnter && !isReviewMode
                        ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60 grayscale'
                        : isCompleted 
                            ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-900/30' 
                            : isInProgress
                                ? 'bg-navy-50 dark:bg-navy-900/10 border-navy-200 dark:border-navy-900/30'
                                : 'bg-white dark:bg-surface-cardDark border-slate-200 dark:border-white/10 hover:border-navy-300 dark:hover:border-navy-700 hover:shadow-md'
                }`}
              >
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                             lab.difficulty === 'Beginner' ? 'text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20' :
                             lab.difficulty === 'Intermediate' ? 'text-gold-600 dark:text-gold-400 border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20' :
                             'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                        }`}>
                            {lab.difficulty}
                        </div>
                        {isCompleted ? (
                            <div className="p-1.5 bg-brand-500 rounded-full shadow-sm">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        ) : isInProgress ? (
                            <div className="p-1.5 bg-navy-500 rounded-full shadow-sm">
                                <History className="w-4 h-4 text-white" />
                            </div>
                        ) : isUnlocked ? (
                            <div className="p-1.5 bg-navy-50 dark:bg-navy-900/30 rounded-full border border-navy-100 dark:border-navy-800">
                                <Unlock className="w-4 h-4 text-navy-600 dark:text-navy-400" />
                            </div>
                        ) : (
                            <Lock className="w-5 h-5 text-slate-300 dark:text-gray-600" />
                        )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2 leading-tight group-hover:text-navy-700 dark:group-hover:text-navy-300 transition-colors">{lab.title}</h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-gray-500 mb-6">WK-{String(lab.weekId).padStart(2,'0')} // EST: {lab.duration.toUpperCase()}</p>

                    {!isUnlocked && !isCompleted && !isInProgress && !isReviewMode && (
                        <div className="flex items-center gap-2 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20 mb-4">
                            <AlertCircle className="w-3 h-3" />
                            <span>REQ: 2 Study Sessions</span>
                        </div>
                    )}

                    <button
                        onClick={() => setActiveLabId(lab.id)}
                        disabled={!canEnter}
                        className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            !canEnter ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 cursor-not-allowed' :
                            isReviewMode ? 'bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400 hover:bg-gold-100 dark:hover:bg-gold-900/30' :
                            isCompleted ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30' :
                            isInProgress ? 'bg-navy-600 text-white hover:bg-navy-700 shadow-sm' :
                            'bg-white dark:bg-white text-navy-900 hover:bg-slate-50 dark:hover:bg-slate-200 border border-slate-200 dark:border-transparent shadow-sm'
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
