
import React, { useState, useEffect } from 'react';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, hasBlogForWeek } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Edit3, Github, Lock, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { verifyGithubActivity } from '../services/geminiService';
import SuccessModal from './SuccessModal';

interface BlogHubProps {
  onActivityLogged: () => void;
}

const BlogHub: React.FC<BlogHubProps> = ({ onActivityLogged }) => {
  const [week, setWeek] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setCompletedItems(getCompletedLabs());
  }, []);

  const weekHasLabOrProject = Object.values(LAB_DATA).find(l => l.weekId === week);
  const isLabDone = weekHasLabOrProject ? completedItems.includes(weekHasLabOrProject.id) : false;
  const isBlogDone = hasBlogForWeek(week);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);

    // Simulate GitHub verification via Gemini (from previous service)
    const check = await verifyGithubActivity(`Blog: ${title}. Repo: ${githubUrl}`);
    
    if (!check.valid && !githubUrl.includes('github.com')) {
         setVerificationResult("❌ Please provide a valid GitHub URL.");
         setIsVerifying(false);
         return;
    }

    // Log Blog Post XP
    logActivity(ActivityType.BLOG_POST, `Blog Post: ${title}`, week);
    // Log GitHub Commit XP
    logActivity(ActivityType.GITHUB_COMMIT, `GitHub Update: Week ${week} Artifacts`, week);
    
    onActivityLogged();
    setIsVerifying(false);
    setVerificationResult("✅ Blog published and Code committed!");
    setShowSuccessModal(true); // Trigger gamification
    
    // Reset form after delay
    setTimeout(() => {
        setTitle('');
        setContent('');
        setGithubUrl('');
        setVerificationResult(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 relative">
        <div className="flex items-center gap-2 mb-6">
            <Edit3 className="text-devops-accent w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">Weekly Blog & Commit</h2>
        </div>

        <div className="bg-devops-card rounded-xl border border-gray-700 p-6">
            <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Select Week to Blog About</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[...Array(48)].map((_, i) => {
                        const w = i + 1;
                        const done = hasBlogForWeek(w);
                        return (
                            <button
                                key={w}
                                onClick={() => setWeek(w)}
                                className={`px-3 py-1 rounded-md text-sm border whitespace-nowrap ${
                                    week === w 
                                    ? 'bg-devops-accent text-white border-devops-accent' 
                                    : done 
                                        ? 'bg-green-900/30 text-green-400 border-green-900/50' 
                                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                                }`}
                            >
                                Week {w} {done && '✓'}
                            </button>
                        );
                    })}
                </div>
            </div>

            {!isLabDone ? (
                <div className="text-center py-12 border border-dashed border-red-900/50 bg-red-900/10 rounded-xl">
                    <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-400">Week {week} Locked</h3>
                    <p className="text-gray-400 mt-2">
                        You must complete the <strong>Lab or Project</strong> for Week {week} before writing your blog.
                    </p>
                </div>
            ) : isBlogDone ? (
                <div className="text-center py-12 border border-dashed border-green-900/50 bg-green-900/10 rounded-xl">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-green-400">Week {week} Complete!</h3>
                    <p className="text-gray-400 mt-2">
                        You have published your blog and pushed your code to GitHub.
                        <br />
                        <span className="text-sm opacity-70">Move on to the next week!</span>
                    </p>
                    <button 
                        onClick={() => setWeek(week + 1)}
                        className="mt-4 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        Go to Week {week + 1}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Blog Title</label>
                        <input 
                            required 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-devops-accent focus:outline-none"
                            placeholder={`e.g., My Experience with Week ${week}'s Lab`} 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Key Learnings & Reflection</label>
                        <textarea 
                            required
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white h-40 focus:border-devops-accent focus:outline-none"
                            placeholder="What went well? What was hard? How did you solve it?" 
                        />
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Github className="w-5 h-5 text-white" />
                            <span className="font-bold text-white">GitHub Integration</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                            By publishing this blog, you will automatically trigger a commit log to your learning repository combining your Lab/Project artifacts and this blog post.
                        </p>
                        <input 
                            required
                            value={githubUrl}
                            onChange={e => setGithubUrl(e.target.value)}
                            className="w-full bg-black border border-gray-600 rounded p-2 text-sm text-green-400 font-mono focus:border-green-500 focus:outline-none"
                            placeholder="https://github.com/username/devops-learning-repo" 
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <span className="text-sm font-medium text-green-400">{verificationResult}</span>
                        <button 
                            type="submit" 
                            disabled={isVerifying || !title || !content || !githubUrl}
                            className="bg-devops-accent hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            Publish & Commit to GitHub (+105 XP)
                        </button>
                    </div>
                </form>
            )}
        </div>

        <SuccessModal 
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            xpEarned={105}
            title="Knowledge Shared! ✍️"
            message="Writing about what you learn cements the knowledge. Great job contributing to the community!"
        />
    </div>
  );
};

export default BlogHub;
