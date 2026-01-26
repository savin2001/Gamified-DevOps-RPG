
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
    <div className="bg-devops-card rounded-xl border border-gray-700 shadow-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Log Progress</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {buttons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => setSelectedType(btn.type)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
              selectedType === btn.type ? `${btn.color} ring-2 ring-white` : 'bg-gray-800 hover:bg-gray-750 text-gray-400'
            }`}
          >
            <btn.icon className="w-6 h-6 mb-2" />
            <span className="text-xs font-medium text-center">{btn.label}</span>
            <span className="text-[10px] opacity-75 mt-1">+{XP_VALUES[btn.type]} XP</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {selectedType === ActivityType.GITHUB_COMMIT ? 'Paste Commit URL or Message' : 'What did you learn today?'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-devops-accent focus:outline-none h-24 resize-none"
            placeholder={selectedType === ActivityType.GITHUB_COMMIT ? "fix: updated VPC security groups..." : "Learned about AWS Lambda triggers and layers..."}
            required
          />
        </div>

        <div className="flex items-center justify-between">
            <span className={`text-sm ${verificationResult?.startsWith('❌') ? 'text-red-400' : 'text-green-400'}`}>
                {verificationResult}
            </span>
            <button
                type="submit"
                disabled={isVerifying || !description}
                className="bg-devops-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                {isVerifying && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                {selectedType === ActivityType.GITHUB_COMMIT ? 'Verify & Log' : 'Claim XP'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityLogger;
