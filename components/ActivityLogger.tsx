
import React, { useState } from 'react';
import { ActivityType } from '../types';
import { XP_VALUES } from '../constants';
import { verifyGithubActivity } from '../services/geminiService';
import { Book, Code, Terminal, Edit3, Github, Loader2 } from 'lucide-react';

interface ActivityLoggerProps {
  onLog: (type: ActivityType, description: string) => void;
}

const ActivityLogger: React.FC<ActivityLoggerProps> = ({ onLog }) => {
  const [selectedType, setSelectedType] = useState<ActivityType>(ActivityType.STUDY_SESSION);
  const [description, setDescription] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedType === ActivityType.GITHUB_COMMIT) {
        setIsVerifying(true);
        setVerificationResult(null);
        const check = await verifyGithubActivity(description);
        setIsVerifying(false);
        
        if (!check.valid) {
            setVerificationResult(`❌ ${check.message}`);
            return;
        }
    }

    onLog(selectedType, description);
    setDescription('');
    setVerificationResult('✅ Activity Logged Successfully!');
    setTimeout(() => setVerificationResult(null), 3000);
  };

  const buttons = [
    { type: ActivityType.STUDY_SESSION, icon: Book, label: 'Study Session', color: 'bg-blue-600 hover:bg-blue-700' },
    { type: ActivityType.LAB_SESSION, icon: Terminal, label: 'Lab Work', color: 'bg-green-600 hover:bg-green-700' },
    { type: ActivityType.PROJECT_WORK, icon: Code, label: 'Project', color: 'bg-navy-600 hover:bg-navy-700' },
    { type: ActivityType.BLOG_POST, icon: Edit3, label: 'Blog Post', color: 'bg-orange-600 hover:bg-orange-700' },
    { type: ActivityType.GITHUB_COMMIT, icon: Github, label: 'GitHub Commit', color: 'bg-gray-700 hover:bg-gray-600' },
  ];

  return (
    <div className="bg-white dark:bg-surface-cardDark rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
      <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-4">Log Progress</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {buttons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => setSelectedType(btn.type)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
              selectedType === btn.type 
                ? `${btn.color} text-white shadow-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-brand-500` 
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <btn.icon className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold text-center">{btn.label}</span>
            <span className="text-[10px] opacity-75 mt-1 font-mono">+{XP_VALUES[btn.type]} XP</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {selectedType === ActivityType.GITHUB_COMMIT ? 'Paste Commit URL or Message' : 'What did you learn today?'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none h-24 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600"
            placeholder={selectedType === ActivityType.GITHUB_COMMIT ? "fix: updated VPC security groups..." : "Learned about AWS Lambda triggers and layers..."}
            required
          />
        </div>

        <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${verificationResult?.startsWith('❌') ? 'text-red-500' : 'text-emerald-500'}`}>
                {verificationResult}
            </span>
            <button
                type="submit"
                disabled={isVerifying || !description}
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isVerifying && <Loader2 className="animate-spin w-4 h-4" />}
                {selectedType === ActivityType.GITHUB_COMMIT ? 'Verify & Log' : 'Claim XP'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityLogger;
