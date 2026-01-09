
import React, { useState, useEffect } from 'react';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, saveLabCompletion, getLabSubmissions, saveLabSubmission } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Lock, Unlock, Code, CheckCircle2, Terminal, Eye, BookOpen, AlertTriangle, Play, Box, Save, History } from 'lucide-react';
import SuccessModal from './SuccessModal';
import FocusTimer from './FocusTimer';

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

  useEffect(() => {
    setCompletedItems(getCompletedLabs());
    setSavedSubmissions(getLabSubmissions());
  }, []);

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

  const handleCompleteProject = (projId: string, weekId: number) => {
    if (isReviewMode) return;

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
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-xl border border-white/10">
                    <Box className="text-purple-400 w-6 h-6" />
                </span>
                Project Portfolio
            </h2>
            <p className="text-gray-400 mt-1 ml-1 text-sm">Capstone challenges to prove your engineering skills.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <FocusTimer />
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
                        <span className="text-xs font-bold uppercase tracking-wider">Build Mode</span>
                    </>
                )}
            </button>
        </div>
      </div>

      {activeProjectId ? (
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
           {(() => {
             const proj = Object.values(LAB_DATA).find(l => l.id === activeProjectId);
             if (!proj) return null;
             
             const isPreviouslyCompleted = completedItems.includes(proj.id);
             
             return (
                 <div className="flex flex-col h-[800px] lg:h-[700px] lg:flex-row">
                    {/* Sidebar / Instructions */}
                    <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col bg-gray-900/50">
                        <div className={`p-6 border-b border-white/10 ${isReviewMode ? 'bg-yellow-500/5' : 'bg-purple-900/10'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">PROJ-{proj.weekId}</span>
                                {isReviewMode ? (
                                    <span className="text-[10px] font-bold text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded bg-yellow-500/10">READ ONLY</span>
                                ) : (
                                    <span className="text-xs font-mono text-gray-500">{proj.difficulty}</span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white leading-tight">{proj.title}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                             <div>
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Milestones</h4>
                                <ul className="space-y-3">
                                    {proj.objectives.map((o, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></div>
                                            {o}
                                        </li>
                                    ))}
                                </ul>
                             </div>
                             
                             <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Architecture Steps</h4>
                                {proj.steps.map((step, i) => (
                                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <h5 className="text-sm font-bold text-white mb-2 flex justify-between">
                                            {step.title}
                                            <span className="text-[10px] text-gray-600 font-mono">STEP 0{i+1}</span>
                                        </h5>
                                        <p className="text-xs text-gray-400 leading-relaxed">{step.instruction}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-black/20">
                            <button 
                                onClick={() => { 
                                    if (!isReviewMode) handleSaveDraft(proj.id); 
                                    else setActiveProjectId(null);
                                }}  
                                className="w-full text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                {isReviewMode ? '← Return to Hub' : '← Save Draft & Return'}
                            </button>
                        </div>
                    </div>

                    {/* Main / Terminal */}
                    <div className="lg:w-2/3 flex flex-col bg-[#0f0b14] relative">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                         
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

                         <div className="flex-1 p-8 font-mono text-sm overflow-hidden flex flex-col">
                             <div className="text-gray-500 mb-6">
                                 DevOps Quest Deployment Manager<br/>
                                 Target: {proj.title}<br/>
                                 {isReviewMode ? 'System Status: READ_ONLY_MOUNT' : 'Initiating verification sequence...'}
                             </div>
                             
                             <div className={`flex-1 bg-black/50 border ${isReviewMode ? 'border-yellow-500/10' : 'border-white/10'} rounded-xl p-6 relative overflow-hidden shadow-inner`}>
                                 <div className="absolute top-3 right-3 text-[10px] text-purple-500/50 font-bold border border-purple-900 rounded px-2">DEPLOY LOGS</div>
                                 <textarea 
                                    readOnly={isReviewMode}
                                    value={output}
                                    onChange={(e) => setOutput(e.target.value)}
                                    className={`w-full h-full bg-transparent ${isReviewMode ? 'text-gray-500 cursor-not-allowed' : 'text-purple-300'} focus:outline-none resize-none leading-relaxed`}
                                    placeholder={isReviewMode ? "Terminal input disabled in Review Mode." : `$ ${proj.verificationCommand || "aws verify-stack"}\n\n... waiting for resource output ...\n... ${proj.expectedOutput || "StackId: arn:aws:cloudformation..."}`}
                                    autoFocus={!isReviewMode}
                                 />
                             </div>
                         </div>

                         <div className="p-6 border-t border-white/10 bg-purple-900/10 flex justify-between items-center gap-4">
                             <span className={`text-xs ${output.length > 2 ? 'text-purple-400' : 'text-gray-600'}`}>
                                 {output.length > 2 ? '● Deployment Found' : '○ Waiting for Artifacts'}
                             </span>

                             <div className="flex gap-3">
                                {isReviewMode ? (
                                    <div className="px-4 py-3 rounded-lg border border-yellow-500/20 text-yellow-500 text-xs font-bold bg-yellow-500/5 flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> READ ONLY PREVIEW
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleSaveDraft(proj.id)}
                                            className="px-4 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> Save Draft
                                        </button>
                                        <button 
                                            onClick={() => handleCompleteProject(proj.id, proj.weekId)}
                                            disabled={output.length < 2}
                                            className="bg-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:grayscale text-white font-bold px-8 py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> 
                                            {isPreviouslyCompleted ? 'Redeploy' : 'Verify Deployment'}
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
                        ? 'bg-gray-900/20 border-white/5 opacity-60 grayscale'
                        : isCompleted 
                            ? 'bg-purple-900/10 border-purple-500/30' 
                            : isInProgress
                                ? 'bg-indigo-900/10 border-indigo-500/30'
                                : 'bg-gray-900/40 border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                }`}
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10 uppercase tracking-widest">
                            {proj.difficulty}
                        </span>
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
                    
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-purple-200 transition-colors">{proj.title}</h3>
                    <p className="text-sm font-mono text-gray-500 mb-6">PROJ-{String(proj.weekId).padStart(3,'0')} // {proj.duration.toUpperCase()}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                        {proj.objectives.slice(0, 3).map((obj, i) => (
                            <span key={i} className="text-[10px] bg-black/40 text-gray-300 px-2 py-1 rounded border border-white/10">
                                {obj}
                            </span>
                        ))}
                    </div>

                    {!isUnlocked && !isCompleted && !isInProgress && !isReviewMode && (
                        <div className="flex items-center gap-2 text-[10px] text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10 mb-6">
                            <AlertTriangle className="w-4 h-4" />
                            <span>LOCKED: Complete all Phase Labs first.</span>
                        </div>
                    )}

                    <button
                        onClick={() => setActiveProjectId(proj.id)}
                        disabled={!canEnter}
                        className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            !canEnter ? 'bg-white/5 text-gray-600 cursor-not-allowed' :
                            isReviewMode ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' :
                            isCompleted ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' :
                            isInProgress ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg' :
                            'bg-white text-black hover:bg-purple-50 shadow-lg shadow-white/10'
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
