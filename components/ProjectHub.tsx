
import React, { useState, useEffect, useRef } from 'react';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, saveLabCompletion, getLabSubmissions, saveLabSubmission } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Lock, Unlock, Code, CheckCircle2, Terminal, Eye, BookOpen, AlertTriangle, Play, Box, Save, History, Loader2, XCircle } from 'lucide-react';
import SuccessModal from './SuccessModal';
import FocusTimer, { FocusTimerHandle } from './FocusTimer';

interface ProjectHubProps {
  onActivityLogged: () => void;
}

const ProjectHub: React.FC<ProjectHubProps> = ({ onActivityLogged }) => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [savedSubmissions, setSavedSubmissions] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const timerRef = useRef<FocusTimerHandle>(null);

  useEffect(() => {
    setCompletedItems(getCompletedLabs());
    setSavedSubmissions(getLabSubmissions());
  }, []);

  useEffect(() => {
    if (activeProjectId) {
        timerRef.current?.reset();
        timerRef.current?.start();
        setValidationError(null);
    } else {
        timerRef.current?.pause();
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
        const submissions = getLabSubmissions();
        if (submissions[activeProjectId]) {
            setOutput(submissions[activeProjectId]);
        } else {
            setOutput('');
        }
    }
  }, [activeProjectId]);

  const handleCompleteProject = async (projId: string, weekId: number) => {
    if (isReviewMode) return;

    setIsExecuting(true);
    setValidationError(null);

    // Find the project definition
    const proj = Object.values(LAB_DATA).find(l => l.id === projId);

    // Simulate Verification Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (proj) {
        const expected = (proj.expectedOutput || '').toLowerCase();
        const userOutput = output.toLowerCase();

        // Validation Logic
        if (!userOutput.includes(expected)) {
            setValidationError(`Verification Failed: Infrastructure mismatch.\nExpected resource signature: "${proj.expectedOutput}"`);
            setIsExecuting(false);
            return;
        }
    }

    saveLabCompletion(projId);
    saveLabSubmission(projId, output);
    
    const newCompleted = [...completedItems, projId];
    setCompletedItems(newCompleted);
    setSavedSubmissions(prev => ({...prev, [projId]: output}));
    
    if (!completedItems.includes(projId)) {
        logActivity(ActivityType.PROJECT_WORK, `Completed Project: ${LAB_DATA[Number(projId.split('-')[1])]?.title}`, weekId);
        onActivityLogged();
        setShowSuccessModal(true);
    }
    
    setIsExecuting(false);
    setActiveProjectId(null);
    setOutput('');
  };

  const handleSaveDraft = (id: string) => {
      if (isReviewMode) return;
      saveLabSubmission(id, output);
      setSavedSubmissions(prev => ({...prev, [id]: output}));
      setActiveProjectId(null);
  };

  const projects = Object.values(LAB_DATA).filter(l => l.type === 'Project');

  const checkPrerequisites = (projectWeekId: number) => {
      const requiredLabs = Object.values(LAB_DATA)
          .filter(l => l.type === 'Lab' && l.weekId <= projectWeekId); 
      const missingLabs = requiredLabs.filter(l => !completedItems.includes(l.id));
      return missingLabs.length === 0;
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-navy-500/20 to-blue-500/10 rounded-xl border border-slate-200 dark:border-white/10">
                    <Box className="text-navy-600 dark:text-navy-400 w-6 h-6" />
                </span>
                Project Portfolio
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mt-1 ml-1 text-sm">Capstone challenges to prove your engineering skills.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <FocusTimer 
                ref={timerRef}
                initialMinutes={180} 
                enablePomodoro={false} 
            />
            <button 
                onClick={() => setIsReviewMode(!isReviewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    isReviewMode 
                    ? 'bg-gold-100 dark:bg-gold-900/20 border-gold-200 dark:border-gold-800 text-gold-700 dark:text-gold-400 hover:bg-gold-200 dark:hover:bg-gold-900/30' 
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10'
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
                        <span className="text-xs font-bold uppercase tracking-wider">Build Mode</span>
                    </>
                )}
            </button>
        </div>
      </div>

      {activeProjectId ? (
        <div className="bg-white dark:bg-surface-cardDark backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
           {(() => {
             const proj = Object.values(LAB_DATA).find(l => l.id === activeProjectId);
             if (!proj) return null;
             
             const isPreviouslyCompleted = completedItems.includes(proj.id);
             
             return (
                 <div className="flex flex-col h-[800px] lg:h-[700px] lg:flex-row">
                    {/* Sidebar / Instructions */}
                    <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50 dark:bg-black/20">
                        <div className={`p-6 border-b border-slate-200 dark:border-white/10 ${isReviewMode ? 'bg-gold-50 dark:bg-gold-900/10' : 'bg-navy-50 dark:bg-navy-900/20'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-navy-600 dark:text-navy-400 bg-navy-100 dark:bg-navy-500/10 px-2 py-0.5 rounded border border-navy-200 dark:border-navy-500/20">PROJ-{proj.weekId}</span>
                                {isReviewMode ? (
                                    <span className="text-[10px] font-bold text-gold-600 dark:text-gold-500 border border-gold-200 dark:border-gold-500/20 px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-500/10">READ ONLY</span>
                                ) : (
                                    <span className="text-xs font-mono text-slate-500 dark:text-gray-500">{proj.difficulty}</span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{proj.title}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                             <div>
                                <h4 className="text-xs font-bold text-navy-600 dark:text-navy-400 uppercase tracking-wider mb-3">Milestones</h4>
                                <ul className="space-y-3">
                                    {proj.objectives.map((o, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-gray-300">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-navy-500 shadow-sm"></div>
                                            {o}
                                        </li>
                                    ))}
                                </ul>
                             </div>
                             
                             <div className="space-y-6">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Architecture Steps</h4>
                                {proj.steps.map((step, i) => (
                                    <div key={i} className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/5 shadow-sm">
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex justify-between">
                                            {step.title}
                                            <span className="text-[10px] text-slate-400 dark:text-gray-600 font-mono">STEP 0{i+1}</span>
                                        </h5>
                                        <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{step.instruction}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20">
                            <button 
                                onClick={() => { 
                                    if (!isReviewMode) handleSaveDraft(proj.id); 
                                    else setActiveProjectId(null);
                                }} 
                                disabled={isExecuting}
                                className="w-full text-xs text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                {isReviewMode ? '← Return to Hub' : '← Save Draft & Return'}
                            </button>
                        </div>
                    </div>

                    {/* Main / Terminal */}
                    <div className="lg:w-2/3 flex flex-col bg-surface-cardDark relative">
                         <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5">
                             <div className="flex gap-2">
                                 <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                 <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                 <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                             </div>
                             <div className="text-[10px] font-mono text-gray-500 flex items-center gap-2">
                                 <Terminal className="w-3 h-3" /> aws-cli — deployment {isReviewMode && '(LOCKED)'}
                             </div>
                         </div>

                         <div className="flex-1 p-8 font-mono text-sm overflow-hidden flex flex-col text-slate-300">
                             <div className="text-gray-500 mb-6">
                                 DevOps Quest Deployment Manager<br/>
                                 Target: {proj.title}<br/>
                                 {isExecuting ? 'Status: VERIFYING_INFRASTRUCTURE...' : isReviewMode ? 'Status: READ_ONLY_MOUNT' : 'Status: Ready to deploy'}
                             </div>
                             
                             <div className={`flex-1 bg-black/50 border ${isReviewMode ? 'border-gold-500/10' : validationError ? 'border-red-500/30' : 'border-white/10'} rounded-xl p-6 relative overflow-hidden shadow-inner`}>
                                 <div className="absolute top-3 right-3 text-[10px] text-navy-400 font-bold border border-navy-800 rounded px-2">DEPLOY LOGS</div>
                                 <textarea 
                                    readOnly={isReviewMode || isExecuting}
                                    value={output}
                                    onChange={(e) => {
                                        setOutput(e.target.value);
                                        if (validationError) setValidationError(null);
                                    }}
                                    className={`w-full h-full bg-transparent ${isReviewMode ? 'text-gray-500 cursor-not-allowed' : 'text-navy-300'} focus:outline-none resize-none leading-relaxed disabled:opacity-50`}
                                    placeholder={isReviewMode ? "Terminal input disabled in Review Mode." : `$ ${proj.verificationCommand || "aws verify-stack"}\n\n... waiting for resource output ...\n... ${proj.expectedOutput || "StackId: arn:aws:cloudformation..."}`}
                                    autoFocus={!isReviewMode}
                                 />
                                 {isExecuting && (
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                                         <div className="flex items-center gap-2 text-brand-400">
                                             <Loader2 className="w-5 h-5 animate-spin" />
                                             <span>Verifying Cloud Resources...</span>
                                         </div>
                                     </div>
                                 )}
                             </div>

                             {validationError && (
                                 <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-xs animate-in slide-in-from-top-1">
                                     <div className="flex items-center gap-2 font-bold mb-1">
                                         <XCircle className="w-4 h-4" /> Deployment Verification Failed
                                     </div>
                                     <pre className="whitespace-pre-wrap font-mono ml-6">{validationError}</pre>
                                 </div>
                             )}
                         </div>

                         <div className="p-6 border-t border-white/10 bg-navy-900/10 flex justify-between items-center gap-4">
                             <span className={`text-xs ${output.length > 2 ? 'text-navy-400' : 'text-gray-600'}`}>
                                 {output.length > 2 ? '● Deployment Found' : '○ Waiting for Artifacts'}
                             </span>

                             <div className="flex gap-3">
                                {isReviewMode ? (
                                    <div className="px-4 py-3 rounded-lg border border-gold-500/20 text-gold-500 text-xs font-bold bg-gold-500/5 flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> READ ONLY PREVIEW
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleSaveDraft(proj.id)}
                                            disabled={isExecuting}
                                            className="px-4 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" /> Save Draft
                                        </button>
                                        <button 
                                            onClick={() => handleCompleteProject(proj.id, proj.weekId)}
                                            disabled={output.length < 2 || isExecuting}
                                            className="bg-navy-600 hover:bg-navy-500 disabled:opacity-50 disabled:grayscale text-white font-bold px-8 py-3 rounded-lg transition-all shadow-md flex items-center gap-2"
                                        >
                                            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            {isExecuting ? 'Verifying...' : isPreviouslyCompleted ? 'Redeploy' : 'Verify Deployment'}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const isCompleted = completedItems.includes(proj.id);
            const isInProgress = !isCompleted && savedSubmissions[proj.id] && savedSubmissions[proj.id].length > 0;
            const prerequisitesMet = checkPrerequisites(proj.weekId);
            const isUnlocked = prerequisitesMet || isCompleted;
            const canEnter = isReviewMode || isUnlocked || isInProgress;
            
            return (
              <div 
                key={proj.id} 
                className={`group relative rounded-3xl p-8 border transition-all duration-300 overflow-hidden ${
                    !canEnter && !isReviewMode
                        ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60 grayscale'
                        : isCompleted 
                            ? 'bg-navy-50 dark:bg-navy-900/10 border-navy-200 dark:border-navy-500/30' 
                            : isInProgress
                                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/30'
                                : 'bg-white dark:bg-surface-cardDark border-slate-200 dark:border-white/10 hover:border-navy-300 dark:hover:border-navy-500/50 hover:shadow-lg'
                }`}
              >
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full border border-navy-200 dark:border-navy-500/30 text-navy-600 dark:text-navy-400 bg-navy-100 dark:bg-navy-500/10 uppercase tracking-widest">
                            {proj.difficulty}
                        </span>
                        {isCompleted ? (
                            <div className="p-1.5 bg-brand-500 rounded-full shadow-sm">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        ) : isInProgress ? (
                            <div className="p-1.5 bg-navy-500 rounded-full shadow-sm">
                                <History className="w-4 h-4 text-white" />
                            </div>
                        ) : isUnlocked ? (
                            <div className="p-1.5 bg-navy-100 dark:bg-navy-500/20 rounded-full border border-navy-200 dark:border-navy-500/50">
                                <Unlock className="w-4 h-4 text-navy-600 dark:text-navy-400" />
                            </div>
                        ) : (
                            <Lock className="w-5 h-5 text-slate-400 dark:text-gray-600" />
                        )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-navy-600 dark:group-hover:text-navy-200 transition-colors">{proj.title}</h3>
                    <p className="text-sm font-mono text-slate-500 dark:text-gray-500 mb-6">PROJ-{String(proj.weekId).padStart(3,'0')} // {proj.duration.toUpperCase()}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                        {proj.objectives.slice(0, 3).map((obj, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-gray-300 px-2 py-1 rounded border border-slate-200 dark:border-white/10">
                                {obj}
                            </span>
                        ))}
                    </div>

                    {!isUnlocked && !isCompleted && !isInProgress && !isReviewMode && (
                        <div className="flex items-center gap-2 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5 p-3 rounded-lg border border-red-200 dark:border-red-500/10 mb-6">
                            <AlertTriangle className="w-4 h-4" />
                            <span>LOCKED: Complete all Phase Labs first.</span>
                        </div>
                    )}

                    <button
                        onClick={() => setActiveProjectId(proj.id)}
                        disabled={!canEnter}
                        className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            !canEnter ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 cursor-not-allowed' :
                            isReviewMode ? 'bg-gold-50 dark:bg-gold-900/10 text-gold-700 dark:text-gold-400 hover:bg-gold-100 dark:hover:bg-gold-900/20' :
                            isCompleted ? 'bg-navy-100 dark:bg-navy-900/20 text-navy-700 dark:text-navy-400 hover:bg-navy-200 dark:hover:bg-navy-900/30' :
                            isInProgress ? 'bg-navy-600 text-white hover:bg-navy-500 shadow-sm' :
                            'bg-white dark:bg-white text-black hover:bg-navy-50 dark:hover:bg-navy-50 shadow-sm'
                        }`}
                    >
                        {isReviewMode ? 'Preview (Read Only)' : 
                         isCompleted ? 'View Architecture' : 
                         isInProgress ? 'Resume Project' :
                         !canEnter ? 'Prerequisites Missing' : 
                         <>Initialize Project <Code className="w-4 h-4" /></>}
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
        xpEarned={200}
        title="Project Shipped! 🚀"
        message="You just built something real. Add this to your portfolio and keep the momentum going!"
      />
    </div>
  );
};

export default ProjectHub;
