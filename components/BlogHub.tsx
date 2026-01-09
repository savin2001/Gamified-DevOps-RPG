
import React, { useState, useEffect, useRef } from 'react';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, hasBlogForWeek, saveBlogPost, getBlogPostForWeek, getNotebookEntries, getLabSubmissions } from '../services/gamificationService';
import { ActivityType, BlogPost } from '../types';
import { Edit3, Github, Lock, CheckCircle2, Send, ChevronRight, Hash, Sparkles, Terminal, Globe, Share2, FileText, Code, Copy, Eye } from 'lucide-react';
import { verifyGithubActivity } from '../services/geminiService';
import SuccessModal from './SuccessModal';

interface BlogHubProps {
  onActivityLogged: () => void;
}

const BlogHub: React.FC<BlogHubProps> = ({ onActivityLogged }) => {
  const [week, setWeek] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('https://github.com/savin2001/devops-learning-journey');
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Artifact Viewer State
  const [activeArtifactTab, setActiveArtifactTab] = useState<'blog' | 'study' | 'lab'>('blog');
  const [existingBlog, setExistingBlog] = useState<BlogPost | undefined>(undefined);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    setCompletedItems(getCompletedLabs());
  }, []);

  // Sync with data when week changes
  useEffect(() => {
    setExistingBlog(getBlogPostForWeek(week));
    if (scrollRef.current) {
        const activeBtn = scrollRef.current.querySelector(`[data-week="${week}"]`);
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    }
  }, [week]);

  const weekHasLabOrProject = Object.values(LAB_DATA).find(l => l.weekId === week);
  const isLabDone = weekHasLabOrProject ? completedItems.includes(weekHasLabOrProject.id) : false;
  const isBlogDone = !!existingBlog;

  // --- ARTIFACT GENERATORS ---
  const generateStudyArtifact = () => {
    const entries = getNotebookEntries().filter(e => e.week === week).sort((a,b) => a.day - b.day);
    if (entries.length === 0) return "> No study sessions logged for this week.";
    
    return entries.map(e => `## Day ${e.day}: ${e.mainTopic}
**Date:** ${e.date} | **Duration:** ${e.duration}h

### 🧠 Concepts
${e.topics.map(t => `- **${t.title}**: ${t.notes.substring(0, 100)}...`).join('\n')}

### 💻 Hands-On
${e.activities.map(a => `- [x] ${a}`).join('\n')}
${e.handsOnCode ? `\`\`\`bash\n${e.handsOnCode}\n\`\`\`` : ''}

### 📝 Reflections
*${e.reflection || "No reflection logged."}*
`).join('\n\n---\n\n');
  };

  const generateLabArtifact = () => {
    const submissions = getLabSubmissions();
    const weekLabs = Object.values(LAB_DATA).filter(l => l.weekId === week);
    if (weekLabs.length === 0) return "> No labs scheduled for this week.";

    return weekLabs.map(l => {
        const output = submissions[l.id];
        const status = output ? "✅ Completed" : "❌ Not Attempted";
        return `## ${l.id}: ${l.title}
**Type:** ${l.type} | **Status:** ${status}

### Objective
${l.objectives.join(', ')}

### Verification Output
\`\`\`bash
${output || "# No output recorded"}
\`\`\`
`;
    }).join('\n\n');
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);

    let cleanUrl = githubUrl.trim();
    if (cleanUrl.endsWith('.git')) {
        cleanUrl = cleanUrl.slice(0, -4);
        setGithubUrl(cleanUrl);
    }

    const check = await verifyGithubActivity(`Blog: ${title}. Repo: ${cleanUrl}`);
    
    if (!check.valid && !cleanUrl.includes('github.com')) {
         setVerificationResult("❌ Invalid GitHub URL detected.");
         setIsVerifying(false);
         return;
    }

    const newPost: BlogPost = {
        id: Date.now().toString(),
        week,
        title,
        content,
        githubUrl: cleanUrl,
        timestamp: new Date().toISOString()
    };

    saveBlogPost(newPost);
    setExistingBlog(newPost);
    
    logActivity(ActivityType.BLOG_POST, `Blog Post: ${title}`, week);
    logActivity(ActivityType.GITHUB_COMMIT, `GitHub Update: Week ${week} Artifacts`, week);
    
    onActivityLogged();
    setIsVerifying(false);
    setShowSuccessModal(true);
    
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-8 relative font-sans">
        {/* Header Section */}
        <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/10 rounded-xl border border-white/10">
                            <Edit3 className="text-purple-400 w-6 h-6" />
                        </span>
                        Engineering Journal
                    </h2>
                    <p className="text-gray-400 mt-1 ml-1 text-sm">Document your journey. Ship your code.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    SYSTEM ONLINE
                </div>
            </div>
        </div>

        {/* Timeline Navigator */}
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-devops-dark to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-devops-dark to-transparent z-10 pointer-events-none"></div>
            
            <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-6 pt-2 px-1 snap-x scrollbar-hide mask-image-linear-gradient"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {[...Array(48)].map((_, i) => {
                    const w = i + 1;
                    const blog = getBlogPostForWeek(w);
                    const active = week === w;
                    
                    return (
                        <button
                            key={w}
                            data-week={w}
                            onClick={() => setWeek(w)}
                            className={`
                                relative flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl border transition-all duration-300 snap-center
                                ${active 
                                    ? 'bg-gradient-to-b from-purple-500/20 to-blue-600/10 border-purple-500/50 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] scale-105 z-10' 
                                    : blog 
                                        ? 'bg-green-900/10 border-green-500/20 opacity-70 hover:opacity-100 hover:bg-green-900/20' 
                                        : 'bg-gray-800/30 border-white/5 opacity-50 hover:opacity-80 hover:bg-gray-800/60'
                                }
                            `}
                        >
                            <span className={`text-xs font-mono mb-1 ${active ? 'text-purple-300' : 'text-gray-500'}`}>WK</span>
                            <span className={`text-xl font-bold ${active ? 'text-white' : blog ? 'text-green-400' : 'text-gray-400'}`}>{w}</span>
                            {blog && <div className="absolute bottom-2 w-1 h-1 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]"></div>}
                            {active && <div className="absolute -bottom-1 w-12 h-1 rounded-full bg-purple-500 blur-sm"></div>}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Content Switcher */}
        {!isLabDone && !isBlogDone ? (
             // --- LOCKED STATE ---
            <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-12 text-center group animate-in slide-in-from-bottom-4">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 ring-1 ring-red-500/30 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
                        <Lock className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Week {week} Encrypted</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                        Access to the Engineering Journal is restricted. Complete the <span className="text-red-400 font-mono">Lab Protocol</span> or <span className="text-purple-400 font-mono">Project Deployment</span> for this week to unlock write access.
                    </p>
                    <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-lg border border-red-500/20 text-red-400 text-xs font-mono">
                        <CheckCircle2 className="w-3 h-3 opacity-50" />
                        <span>PREREQUISITE MISSING: LAB-{week.toString().padStart(3, '0')}</span>
                    </div>
                </div>
            </div>
        ) : isBlogDone ? (
            // --- COMPLETED / ARTIFACT VIEWER STATE ---
            <div className="grid lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <div className="flex gap-2">
                                <button onClick={() => setActiveArtifactTab('blog')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeArtifactTab === 'blog' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                    <Edit3 className="w-4 h-4 inline mr-2" /> Blog Post
                                </button>
                                <button onClick={() => setActiveArtifactTab('study')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeArtifactTab === 'study' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                    <FileText className="w-4 h-4 inline mr-2" /> Study Log .md
                                </button>
                                <button onClick={() => setActiveArtifactTab('lab')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeArtifactTab === 'lab' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                    <Terminal className="w-4 h-4 inline mr-2" /> Lab Report .md
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 font-mono hidden sm:block">READ ONLY</div>
                        </div>

                        {/* Content Viewer */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#0c0c0c] relative">
                             {activeArtifactTab === 'blog' && (
                                <div className="prose prose-invert max-w-none">
                                    <h1 className="text-2xl font-bold text-white mb-4">{existingBlog?.title}</h1>
                                    <div className="whitespace-pre-wrap text-gray-300 font-sans leading-relaxed">{existingBlog?.content}</div>
                                </div>
                             )}
                             {activeArtifactTab === 'study' && (
                                <pre className="font-mono text-sm text-blue-300 whitespace-pre-wrap">{generateStudyArtifact()}</pre>
                             )}
                             {activeArtifactTab === 'lab' && (
                                <pre className="font-mono text-sm text-green-300 whitespace-pre-wrap">{generateLabArtifact()}</pre>
                             )}
                        </div>
                        
                        {/* Footer Action */}
                        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                                {activeArtifactTab === 'blog' ? "Published to Journal" : "Auto-generated Artifact"}
                            </div>
                            <button 
                                onClick={() => {
                                    const txt = activeArtifactTab === 'blog' ? existingBlog?.content || '' : activeArtifactTab === 'study' ? generateStudyArtifact() : generateLabArtifact();
                                    handleCopy(txt, activeArtifactTab);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-xs font-bold border border-white/10 transition-colors"
                            >
                                {copySuccess === activeArtifactTab ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                {copySuccess === activeArtifactTab ? "Copied!" : "Copy Markdown"}
                            </button>
                        </div>
                    </div>
                 </div>

                 {/* Sidebar Info */}
                 <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-green-500/20 rounded-full">
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Week {week} Complete</h3>
                                <p className="text-xs text-green-300/70">Artifacts Secured</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            Great work! To make these artifacts visible on your GitHub, copy the Markdown files from the viewer and push them to your repository manually.
                        </p>
                        <a 
                            href={existingBlog?.githubUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Github className="w-4 h-4" /> Open Repository
                        </a>
                    </div>
                    
                    <button onClick={() => setWeek(week + 1)} className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                        Next Week <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
            </div>
        ) : (
            // --- EDITOR STATE (ACTIVE) ---
            <div className="grid lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                <div className="lg:col-span-2 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent rounded-3xl pointer-events-none"></div>
                    <form onSubmit={handleSubmit} className="relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                        <div className="space-y-2 group">
                            <label className="text-xs font-mono text-purple-300 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="w-3 h-3" /> Entry Title
                            </label>
                            <input 
                                required 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-transparent border-b border-gray-700 text-2xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors py-2"
                                placeholder="Title your findings..." 
                            />
                        </div>

                        <div className="space-y-2 group h-full">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-mono text-blue-300 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Reflection
                                </label>
                                <span className="text-[10px] text-gray-500 font-mono">MARKDOWN SUPPORTED</span>
                            </div>
                            <div className="relative">
                                <textarea 
                                    required
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-gray-200 leading-relaxed min-h-[300px] focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:bg-black/40 transition-all resize-none font-sans"
                                    placeholder="Document your technical implementation, blockers resolved, and architecture decisions..." 
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sidebar / Metadata */}
                <div className="space-y-6">
                    <div className="bg-black/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6 flex flex-col gap-4 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                                <Github className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Commit Artifacts</h4>
                                <p className="text-[10px] text-gray-500">Link your code repository</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Terminal className="w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                            </div>
                            <input 
                                required
                                value={githubUrl}
                                onChange={e => setGithubUrl(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-xs font-mono text-green-400 placeholder-gray-700 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-900 transition-all"
                                placeholder="https://github.com/..." 
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/5 rounded-3xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold text-gray-400 uppercase">Rewards</span>
                            <span className="text-xs font-mono text-devops-accent bg-devops-accent/10 px-2 py-1 rounded border border-devops-accent/20">+105 XP</span>
                        </div>

                        {verificationResult && (
                            <div className={`mb-4 text-xs p-3 rounded-lg border ${verificationResult.startsWith('❌') ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-green-500/10 border-green-500/20 text-green-300'}`}>
                                {verificationResult}
                            </div>
                        )}

                        <button 
                            onClick={handleSubmit}
                            disabled={isVerifying || !title || !content || !githubUrl}
                            className="w-full group relative overflow-hidden bg-white text-black py-4 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isVerifying ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Publish Release
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        <SuccessModal 
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            xpEarned={105}
            title="Artifact Shipped! 🚀"
            message="Your learning manifest has been deployed. Consistency is the key to mastery."
        />
    </div>
  );
};

export default BlogHub;
