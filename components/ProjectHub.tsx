
import React, { useState, useEffect } from 'react';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, saveLabCompletion, getLabSubmissions, saveLabSubmission } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Lock, Unlock, Code, CheckCircle2, Terminal, Eye, BookOpen, AlertTriangle } from 'lucide-react';
import SuccessModal from './SuccessModal';

interface ProjectHubProps {
  onActivityLogged: () => void;
}

const ProjectHub: React.FC<ProjectHubProps> = ({ onActivityLogged }) => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [output, setOutput] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setCompletedItems(getCompletedLabs());
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
    saveLabCompletion(projId);
    saveLabSubmission(projId, output);
    setCompletedItems([...completedItems, projId]);
    
    if (!completedItems.includes(projId)) {
        logActivity(ActivityType.PROJECT_WORK, `Completed Project: ${LAB_DATA[Number(projId.split('-')[1])]?.title}`, weekId);
        onActivityLogged();
        setShowSuccessModal(true); // Trigger gamification
    }
    setActiveProjectId(null);
    setOutput('');
  };

  const handleSaveProgress = (id: string) => {
      saveLabSubmission(id, output);
  };

  // Filter only Projects
  const projects = Object.values(LAB_DATA).filter(l => l.type === 'Project');

  // Helper to check if previous labs are done. 
  // Rule: Project unlocks if all Labs with weekId < Project.weekId are completed.
  const checkPrerequisites = (projectWeekId: number) => {
      const requiredLabs = Object.values(LAB_DATA)
          .filter(l => l.type === 'Lab' && l.weekId <= projectWeekId); // All labs up to this week
      
      const missingLabs = requiredLabs.filter(l => !completedItems.includes(l.id));
      return missingLabs.length === 0;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code className="text-purple-400" />
          Project Portfolio
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
                    <span className="text-sm font-medium">Standard Mode</span>
                </>
            )}
        </button>
      </div>

      {activeProjectId ? (
        <div className="bg-devops-card rounded-xl border border-gray-700 p-6 animate-in fade-in slide-in-from-bottom-4">
           {(() => {
             const proj = Object.values(LAB_DATA).find(l => l.id === activeProjectId);
             if (!proj) return null;
             
             const isPreviouslyCompleted = completedItems.includes(proj.id);
             
             return (
                 <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                            <p className="text-gray-400 text-sm">Week {proj.weekId} • {proj.duration} • {proj.difficulty}</p>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                    handleSaveProgress(proj.id);
                                    setActiveProjectId(null);
                                }} 
                                className="text-gray-400 hover:text-white px-3 py-1 text-sm border border-transparent hover:border-gray-600 rounded"
                            >
                                Save & Exit
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
                                <h4 className="font-bold text-purple-400 mb-2">Project Requirements</h4>
                                <ul className="list-disc list-inside text-sm text-gray-300">
                                    {proj.objectives.map((o, i) => <li key={i}>{o}</li>)}
                                </ul>
                            </div>
                            
                            <div className="space-y-4">
                                {proj.steps.map((step, i) => (
                                    <div key={i} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
                                        <h5 className="font-bold text-white mb-1">Phase {i+1}: {step.title}</h5>
                                        <p className="text-sm text-gray-400 mb-2">{step.instruction}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 h-fit sticky top-6">
                            <div className="flex items-center gap-2 mb-4 text-gray-400">
                                <Terminal className="w-5 h-5" />
                                <span>Verification Console</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Run validation command for your project deployment:</p>
                             {proj.verificationCommand && (
                                <div className="mb-4 text-xs font-mono bg-black p-2 rounded text-gray-400 border border-gray-800 break-all">
                                    $ {proj.verificationCommand}
                                </div>
                            )}
                            <textarea 
                                value={output}
                                onChange={(e) => setOutput(e.target.value)}
                                className="w-full bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-48 border border-gray-700 focus:border-green-500 focus:outline-none resize-none"
                                placeholder={`Expected output:\n${proj.expectedOutput || "..."}`}
                            />
                            <div className="mt-4 flex justify-end">
                                <button 
                                    onClick={() => handleCompleteProject(proj.id, proj.weekId)}
                                    disabled={output.length < 2}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> 
                                    {isPreviouslyCompleted ? 'Update Project' : 'Verify Project'}
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
          {projects.map((proj) => {
            const isCompleted = completedItems.includes(proj.id);
            const prerequisitesMet = checkPrerequisites(proj.weekId);
            const isUnlocked = isReviewMode || prerequisitesMet || isCompleted;
            
            return (
              <div 
                key={proj.id} 
                className={`rounded-xl border p-6 transition-all ${
                    !isUnlocked
                        ? 'bg-gray-900/50 border-gray-800 opacity-60'
                        : isCompleted 
                            ? 'bg-gray-900/30 border-purple-900/50' 
                            : 'bg-devops-card border-gray-700 hover:border-purple-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs px-2 py-1 rounded border border-purple-500/30 text-purple-400 bg-purple-500/10">
                        {proj.difficulty} Project
                    </span>
                    {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : isUnlocked ? (
                        <Unlock className="w-5 h-5 text-gray-400" />
                    ) : (
                        <Lock className="w-5 h-5 text-gray-600" />
                    )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{proj.title}</h3>
                <p className="text-sm text-gray-400 mb-4">Week {proj.weekId} • {proj.duration}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                    {proj.objectives.slice(0, 3).map((obj, i) => (
                        <span key={i} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">
                            {obj}
                        </span>
                    ))}
                </div>

                {!isUnlocked && !isCompleted && (
                    <p className="text-xs text-red-400 mb-3 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Complete all Labs up to Week {proj.weekId} to unlock
                    </p>
                )}

                <button
                    onClick={() => setActiveProjectId(proj.id)}
                    disabled={!isUnlocked}
                    className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                        !isUnlocked ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                        isCompleted ? 'bg-purple-900/20 text-purple-400 border border-purple-900/50 hover:bg-purple-900/40' :
                        'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                >
                    {isCompleted ? 'Review Project' : !isUnlocked ? 'Locked' : 'Start Project'}
                </button>
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
