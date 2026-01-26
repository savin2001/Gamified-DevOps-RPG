
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { LAB_DATA } from '../constants';
import { getCompletedLabs, logActivity, saveBlogPost, getBlogPostForWeek, getNotebookEntries, getLabSubmissions } from '../services/gamificationService';
import { ActivityType, BlogPost } from '../types';
import { Edit3, Github, Lock, CheckCircle2, Send, ChevronRight, Hash, Sparkles, Terminal, FileText, Copy } from 'lucide-react';
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
    
    return entries.map(e => {
        // 1. Resources Section
        const resourcesSection = e.resources && e.resources.length > 0
            ? e.resources.map(r => r.url 
                ? `- **${r.type}**: [${r.title}](${r.url})` 
                : `- **${r.type}**: ${r.title}`
              ).join('\n')
            : "_No resources logged._";

        // 2. Concepts & Notes Section
        let notesSection = "_No specific notes recorded._";
        if (e.topics && e.topics.length > 0) {
            notesSection = e.topics.map(t => `#### ${t.title}\n${t.notes}`).join('\n\n');
        } else if (e.concepts && e.concepts.length > 0) {
            notesSection = `**Key Concepts:**\n${e.concepts.map(c => `- ${c}`).join('\n')}`;
            if (e.tools && e.tools.length > 0) {
                notesSection += `\n\n**Tools:**\n${e.tools.map(t => `- ${t}`).join('\n')}`;
            }
        }

        // 3. Hands-On Section
        let handsOnSection = "";
        if (e.activities && e.activities.length > 0) {
             handsOnSection = e.activities.map(a => `- [x] ${a}`).join('\n');
        } else if (e.handsOnDescription) {
             handsOnSection = e.handsOnDescription;
        } else {
             handsOnSection = "_No hands-on activity recorded._";
        }
        
        if (e.handsOnCode) {
            handsOnSection += `\n\n**Snippet:**\n\`\`\`bash\n${e.handsOnCode}\n\`\`\``;
        }

        return `## Day ${e.day}: ${e.mainTopic}
**Date:** ${e.date} | **Duration:** ${e.duration}h

### 🧠 Concepts & Notes
${notesSection}

### 💻 Hands-On
${handsOnSection}

### 📖 Resources Used
${resourcesSection}

### 📝 Reflections
> ${e.reflection || "No reflection logged."}
`;
    }).join('\n\n---\n\n');
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

### 🎯 Objectives
${l.objectives.map(o => `- ${o}`).join('\n')}

### 📟 Verification Output
\`\`\`bash
${output || "# No output recorded"}
\`\`\`
`;
    }).join('\n\n---\n\n');
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

  const markdownComponents = {
    h1: ({node, ...props}: any) => <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-gray-700 pb-3" {...props} />,
    h2: ({node, ...props}: any) => <h3 className="text-xl font-bold text-navy-600 dark:text-navy-400 mt-8 mb-4 flex items-center gap-2" {...props} />,
    h3: ({node, ...props}: any) => <h4 className="text-lg font-bold text-brand-600 dark:text-brand-300 mt-6 mb-3" {...props} />,
    h4: ({node, ...props}: any) => <h5 className="text-md font-bold text-slate-800 dark:text-white mt-4 mb-2" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-4 text-slate-600 dark:text-gray-300 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside mb-4 space-y-2 ml-2 text-slate-600 dark:text-gray-300" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-2 text-slate-600 dark:text-gray-300" {...props} />,
    li: ({node, ...props}: any) => <li className="pl-1" {...props} />,
    a: ({node, ...props}: any) => <a className="text-navy-600 dark:text-navy-400 hover:underline cursor-pointer transition-colors" target="_blank" rel="noreferrer" {...props} />,
    strong: ({node, ...props}: any) => <span className="font-bold text-slate-900 dark:text-white" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-slate-300 dark:border-gray-600 pl-4 italic text-slate-500 dark:text-gray-400 my-4 bg-slate-50 dark:bg-gray-900/50 py-3 pr-2 rounded-r" {...props} />,
    hr: ({node, ...props}: any) => <hr className="border-slate-200 dark:border-gray-800 my-8" {...props} />,
    code: ({node, inline, className, children, ...props}: any) => {
        return inline ? (
            <code className="bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-brand-600 dark:text-brand-300 border border-slate-200 dark:border-white/10" {...props}>{children}</code>
        ) : (
            <code className="block bg-transparent text-sm font-mono text-slate-600 dark:text-gray-300" {...props}>{children}</code>
        );
    },
    pre: ({node, ...props}: any) => <pre className="bg-slate-50 dark:bg-[#0f0f0f] p-4 rounded-xl my-4 overflow-x-auto border border-slate-200 dark:border-white/10 shadow-inner" {...props} />,
  };

  return (
    <div className="space-y-8 relative font-sans">
        {/* Header Section */}
        <div className="relative">
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-gradient-to-br from-navy-500/20 to-brand-500/10 rounded-xl border border-slate-200 dark:border-white/10">
                            <Edit3 className="text-navy-600 dark:text-navy-400 w-6 h-6" />
                        </span>
                        Engineering Journal
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-1 ml-1 text-sm">Document your journey. Ship your code.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-black/20 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                    SYSTEM ONLINE
                </div>
            </div>
        </div>

        {/* Timeline Navigator */}
        <div className="relative group">
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
                                    ? 'bg-gradient-to-b from-navy-500/10 to-brand-600/5 border-navy-400/50 dark:border-navy-500/50 shadow-md scale-105 z-10' 
                                    : blog 
                                        ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-500/20 hover:bg-brand-100 dark:hover:bg-brand-900/20' 
                                        : 'bg-white dark:bg-gray-800/30 border-slate-200 dark:border-white/5 opacity-50 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-gray-800/60'
                                }
                            `}
                        >
                            <span className={`text-xs font-mono mb-1 ${active ? 'text-navy-600 dark:text-navy-300' : 'text-slate-400 dark:text-gray-500'}`}>WK</span>
                            <span className={`text-xl font-bold ${active ? 'text-slate-900 dark:text-white' : blog ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-gray-400'}`}>{w}</span>
                            {blog && <div className="absolute bottom-2 w-1 h-1 rounded-full bg-brand-500 shadow-sm"></div>}
                            {active && <div className="absolute -bottom-1 w-8 h-1 rounded-full bg-navy-500 blur-sm"></div>}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Content Switcher */}
        {!isLabDone && !isBlogDone ? (
             // --- LOCKED STATE ---
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/50 backdrop-blur-sm p-12 text-center group animate-in slide-in-from-bottom-4">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-6 ring-1 ring-red-200 dark:ring-red-500/30 shadow-sm">
                        <Lock className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Week {week} Encrypted</h3>
                    <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                        Access to the Engineering Journal is restricted. Complete the <span className="text-red-500 dark:text-red-400 font-mono">Lab Protocol</span> or <span className="text-navy-600 dark:text-navy-400 font-mono">Project Deployment</span> for this week to unlock write access.
                    </p>
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-black/40 rounded-lg border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono">
                        <CheckCircle2 className="w-3 h-3 opacity-50" />
                        <span>PREREQUISITE MISSING: LAB-{week.toString().padStart(3, '0')}</span>
                    </div>
                </div>
            </div>
        ) : isBlogDone ? (
            // --- COMPLETED / ARTIFACT VIEWER STATE ---
            <div className="grid lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-surface-cardDark backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-black/20">
                            <div className="flex gap-2">
                                <button onClick={() => setActiveArtifactTab('blog')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeArtifactTab === 'blog' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'}`}>
                                    <Edit3 className="w-4 h-4 inline mr-2" /> Blog Post
                                </button>
                                <button onClick={() => setActiveArtifactTab('study')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeArtifactTab === 'study' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'}`}>
                                    <FileText className="w-4 h-4 inline mr-2" /> Study Log .md
                                </button>
                                <button onClick={() => setActiveArtifactTab('lab')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeArtifactTab === 'lab' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'}`}>
                                    <Terminal className="w-4 h-4 inline mr-2" /> Lab Report .md
                                </button>
                            </div>
                            <div className="text-xs text-slate-400 dark:text-gray-500 font-mono hidden sm:block">READ ONLY</div>
                        </div>

                        {/* Content Viewer */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0c0c0c] relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
                             {activeArtifactTab === 'blog' && (
                                <div className="animate-in fade-in duration-300">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-gray-700 pb-4">{existingBlog?.title}</h1>
                                    <ReactMarkdown components={markdownComponents}>
                                        {existingBlog?.content || ''}
                                    </ReactMarkdown>
                                </div>
                             )}
                             {activeArtifactTab === 'study' && (
                                <div className="animate-in fade-in duration-300">
                                    <ReactMarkdown components={markdownComponents}>
                                        {generateStudyArtifact()}
                                    </ReactMarkdown>
                                </div>
                             )}
                             {activeArtifactTab === 'lab' && (
                                <div className="animate-in fade-in duration-300">
                                    <ReactMarkdown components={markdownComponents}>
                                        {generateLabArtifact()}
                                    </ReactMarkdown>
                                </div>
                             )}
                        </div>
                        
                        {/* Footer Action */}
                        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex justify-between items-center">
                            <div className="text-xs text-slate-500 dark:text-gray-500">
                                {activeArtifactTab === 'blog' ? "Published to Journal" : "Auto-generated Artifact"}
                            </div>
                            <button 
                                onClick={() => {
                                    const txt = activeArtifactTab === 'blog' ? existingBlog?.content || '' : activeArtifactTab === 'study' ? generateStudyArtifact() : generateLabArtifact();
                                    handleCopy(txt, activeArtifactTab);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-white text-xs font-bold border border-slate-200 dark:border-white/10 transition-colors"
                            >
                                {copySuccess === activeArtifactTab ? <CheckCircle2 className="w-3 h-3 text-brand-500" /> : <Copy className="w-3 h-3" />}
                                {copySuccess === activeArtifactTab ? "Copied!" : "Copy Markdown"}
                            </button>
                        </div>
                    </div>
                 </div>

                 {/* Sidebar Info */}
                 <div className="space-y-6">
                    <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-500/20 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-brand-100 dark:bg-brand-500/20 rounded-full">
                                <CheckCircle2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Week {week} Complete</h3>
                                <p className="text-xs text-brand-700 dark:text-brand-300/70">Artifacts Secured</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Great work! To make these artifacts visible on your GitHub, copy the Markdown files from the viewer and push them to your repository manually.
                        </p>
                        <a 
                            href={existingBlog?.githubUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="block w-full text-center py-3 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Github className="w-4 h-4" /> Open Repository
                        </a>
                    </div>
                    
                    <button onClick={() => setWeek(week + 1)} className="w-full py-4 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-2xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                        Next Week <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
            </div>
        ) : (
            // --- EDITOR STATE (ACTIVE) ---
            <div className="grid lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                <div className="lg:col-span-2 relative">
                    <form onSubmit={handleSubmit} className="relative bg-white dark:bg-surface-cardDark backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                        <div className="space-y-2 group">
                            <label className="text-xs font-mono text-navy-600 dark:text-navy-300 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="w-3 h-3" /> Entry Title
                            </label>
                            <input 
                                required 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-transparent border-b border-slate-200 dark:border-gray-700 text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-navy-500 transition-colors py-2"
                                placeholder="Title your findings..." 
                            />
                        </div>

                        <div className="space-y-2 group h-full">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-mono text-brand-600 dark:text-brand-300 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Reflection
                                </label>
                                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">MARKDOWN SUPPORTED</span>
                            </div>
                            <div className="relative">
                                <textarea 
                                    required
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-slate-900 dark:text-gray-200 leading-relaxed min-h-[300px] focus:outline-none focus:ring-1 focus:ring-navy-500/50 focus:bg-white dark:focus:bg-black/40 transition-all resize-none font-sans"
                                    placeholder="Document your technical implementation, blockers resolved, and architecture decisions..." 
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sidebar / Metadata */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-4 shadow-lg relative overflow-hidden">
                        
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-100 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700">
                                <Github className="w-5 h-5 text-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Commit Artifacts</h4>
                                <p className="text-[10px] text-slate-500 dark:text-gray-500">Link your code repository</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Terminal className="w-4 h-4 text-slate-400 dark:text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                            </div>
                            <input 
                                required
                                value={githubUrl}
                                onChange={e => setGithubUrl(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-3 text-xs font-mono text-brand-600 dark:text-brand-400 placeholder-slate-400 dark:placeholder-gray-700 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-900 transition-all"
                                placeholder="https://github.com/..." 
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-navy-50 to-brand-50 dark:from-navy-900/20 dark:to-brand-900/20 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold text-slate-400 dark:text-gray-400 uppercase">Rewards</span>
                            <span className="text-xs font-mono text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-400/10 px-2 py-1 rounded border border-brand-200 dark:border-brand-400/20">+105 XP</span>
                        </div>

                        {verificationResult && (
                            <div className={`mb-4 text-xs p-3 rounded-lg border ${verificationResult.startsWith('❌') ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300' : 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-300'}`}>
                                {verificationResult}
                            </div>
                        )}

                        <button 
                            onClick={handleSubmit}
                            disabled={isVerifying || !title || !content || !githubUrl}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isVerifying ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></span>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Publish Release
                                </>
                            )}
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
