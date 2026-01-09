
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ActivityType, NoteEntry } from '../types';
import { logActivity, saveNotebookEntry, getNotebookEntries } from '../services/gamificationService';
import { Save, Plus, Copy, Book, ArrowRight, ArrowLeft, Calendar, Clock, Brain, Code, Zap, Smile, Rocket, Coffee, AlertCircle, Target, ChevronDown, ChevronUp, CheckSquare, Link as LinkIcon, Trash, ExternalLink, Timer } from 'lucide-react';
import SuccessModal from './SuccessModal';
import FocusTimer, { FocusTimerHandle } from './FocusTimer';

interface StudySessionProps {
  onActivityLogged: () => void;
}

const MOODS = [
  { id: 'productive', label: 'Productive', score: 10, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/50' },
  { id: 'curious', label: 'Curious', score: 9, icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/50' },
  { id: 'excited', label: 'Excited', score: 10, icon: Rocket, color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/50' },
  { id: 'neutral', label: 'Neutral', score: 6, icon: Smile, color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/50' },
  { id: 'tired', label: 'Tired', score: 4, icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/50' },
  { id: 'frustrated', label: 'Frustrated', score: 3, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/50' },
];

const RESOURCE_TYPES = ['Documentation', 'Video', 'Article', 'Course', 'GitHub Repo', 'Tool'];

const StudySession: React.FC<StudySessionProps> = ({ onActivityLogged }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Timer & Automation State
  const timerRef = useRef<FocusTimerHandle>(null);
  const [trackedSeconds, setTrackedSeconds] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakType, setBreakType] = useState<'short' | 'long'>('short');

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);

  // --- FORM STATE ---
  // Step 1: Logistics
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(1);
  const [mainTopic, setMainTopic] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState('1.5'); // Default 1.5 hours
  
  // Step 2: Learning Content
  const [topics, setTopics] = useState<{title: string, notes: string}[]>([{ title: '', notes: '' }]);

  // Step 3: Hands On & Challenges
  const [activities, setActivities] = useState<string[]>(['Watched course video', 'Read documentation']);
  const [handsOnCode, setHandsOnCode] = useState('');
  const [challengeProblem, setChallengeProblem] = useState('');
  const [challengeSolution, setChallengeSolution] = useState('');
  const [challengeLearning, setChallengeLearning] = useState('');

  // Step 4: Analysis & Resources
  const [takeaways, setTakeaways] = useState<string[]>(['', '', '']); // Fixed 3 top insights
  const [resources, setResources] = useState<{title: string, url: string, type: string}[]>([{ title: '', url: '', type: 'Documentation' }]);
  const [planGoals, setPlanGoals] = useState<string[]>(['']);
  const [planPrep, setPlanPrep] = useState<string[]>(['']);

  // Step 5: Metrics & Reflection
  const [reflection, setReflection] = useState('');
  const [questions, setQuestions] = useState('');
  const [mood, setMood] = useState('Productive');
  const [energy, setEnergy] = useState(7);
  const [confidence, setConfidence] = useState(7);
  const [focus, setFocus] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [quality, setQuality] = useState<'Strong' | 'Average' | 'Needs Review'>('Average');

  useEffect(() => {
    const loadedEntries = getNotebookEntries();
    setEntries(loadedEntries);
  }, []);

  const calculateNextSession = () => {
    const loadedEntries = getNotebookEntries();
    if (loadedEntries.length > 0) {
        const lastEntry = loadedEntries.reduce((prev, current) => {
            if (current.week > prev.week) return current;
            if (current.week === prev.week && current.day > prev.day) return current;
            return prev;
        });

        if (lastEntry.day < 4) {
            setWeek(lastEntry.week);
            setDay(lastEntry.day + 1);
        } else {
            setWeek(lastEntry.week + 1);
            setDay(1);
        }
    } else {
        setWeek(1);
        setDay(1);
    }
  };

  const startSession = () => {
      calculateNextSession();
      setIsEditing(true);
      setCurrentStep(1);
      setMainTopic('');
      
      // Auto-start timer logic
      setTrackedSeconds(0);
      setDuration('1.5'); // Default goal
      
      // Slight delay to ensure ref is mounted
      setTimeout(() => {
          if (timerRef.current) {
              timerRef.current.reset();
              timerRef.current.start();
          }
      }, 100);
  };

  // --- Timer Callbacks ---
  const handlePhaseComplete = (completedMode: 'focus' | 'break') => {
      if (completedMode === 'focus') {
          // Focus done -> Trigger break
          setBreakType('short');
          setShowBreakModal(true);
          // Play notification sound if possible (omitted for strict code)
      } else {
          // Break done -> Trigger focus
          // Just auto-restart focus or prompt? Let's prompt to be polite.
          setShowBreakModal(true); 
          setBreakType('long'); // Using 'long' here to denote "Back to Work" mode in UI logic
      }
  };

  const confirmBreakPhase = () => {
      setShowBreakModal(false);
      if (timerRef.current) {
          // If we just finished focus (breakType short), we start break
          if (breakType === 'short') {
            timerRef.current.setMode('break');
          } else {
            // We finished break, back to focus
            timerRef.current.setMode('focus');
          }
      }
  };

  const handleTimerTick = (seconds: number) => {
      setTrackedSeconds(seconds);
      // Auto-update duration field if it's currently showing estimate
      // Only update if > 0.1 hours
      if (seconds > 300) {
          const hours = (seconds / 3600).toFixed(1);
          setDuration(hours);
      }
  };

  // --- Handlers ---

  const handleTopicChange = (index: number, field: 'title' | 'notes', value: string) => {
    const newTopics = [...topics];
    newTopics[index][field] = value;
    setTopics(newTopics);
  };
  const addTopic = () => setTopics([...topics, { title: '', notes: '' }]);

  const handleActivityChange = (index: number, value: string) => {
      const newActs = [...activities];
      newActs[index] = value;
      setActivities(newActs);
  }
  const addActivity = () => setActivities([...activities, '']);

  const handleResourceChange = (index: number, field: 'title' | 'url' | 'type', value: string) => {
      const newRes = [...resources];
      newRes[index][field] = value;
      setResources(newRes);
  }
  const addResource = () => setResources([...resources, { title: '', url: '', type: 'Documentation' }]);
  const removeResource = (index: number) => {
      const newRes = [...resources];
      newRes.splice(index, 1);
      setResources(newRes);
  }

  const handleArrayChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => {
      const newArr = [...prev];
      newArr[index] = value;
      return newArr;
    });
  };
  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => setter(prev => [...prev, '']);

  // --- Logic ---

  const calculateSessionScore = () => {
      const energyScore = energy * 10;
      const confidenceScore = confidence * 10;
      const selectedMood = MOODS.find(m => m.label === mood);
      const moodScore = (selectedMood?.score || 5) * 10;
      // Focus Bonus
      const focusBonus = focus === 'High' ? 10 : focus === 'Low' ? -10 : 0;

      const finalScore = (energyScore * 0.3) + (confidenceScore * 0.4) + (moodScore * 0.3) + focusBonus;
      return Math.min(Math.max(Math.round(finalScore), 0), 100);
  };

  const handleSubmit = () => {
    // Final duration calculation based on actual timer if it ran
    const finalDuration = trackedSeconds > 600 ? (trackedSeconds / 3600).toFixed(1) : duration;

    const entry: NoteEntry = {
      id: Date.now().toString(),
      week, day, date, time, 
      duration: finalDuration,
      mainTopic: mainTopic || `Week ${week} Study`,
      status: 'Completed',
      // Allow topics that have content even if title is missing
      topics: topics.filter(t => t.title || t.notes).map(t => ({...t, title: t.title || 'General Notes'})),
      activities: activities.filter(a => a),
      handsOnCode,
      takeaways: takeaways.filter(t => t),
      challenge: {
        problem: challengeProblem,
        solution: challengeSolution,
        learning: challengeLearning
      },
      resources: resources.filter(r => r.title),
      plan: planGoals.map((g, i) => ({ goal: g, prep: planPrep[i] || '' })).filter(p => p.goal),
      mood, energy, confidence, focus, quality,
      reflection, questions,
      // Backward compat filler
      concepts: topics.map(t => t.title || 'Note Block'),
      tools: [],
      handsOnDescription: activities.join(', ')
    };

    saveNotebookEntry(entry);
    setEntries([entry, ...entries]);
    
    logActivity(ActivityType.STUDY_SESSION, `Study Session: ${entry.mainTopic}`, week);
    onActivityLogged();
    
    setSessionScore(calculateSessionScore());
    setShowSuccessModal(true);
    
    // Stop Timer
    if (timerRef.current) timerRef.current.pause();
  };

  const closeSuccessModal = () => {
      setShowSuccessModal(false);
      setIsEditing(false);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // --- GENERATE MARKDOWN ---
  const generateMarkdown = (entry: NoteEntry) => {
    // Resources
    const resourcesSection = entry.resources && entry.resources.length > 0
        ? entry.resources.map(r => r.url 
            ? `- **${r.type}**: [${r.title}](${r.url})` 
            : `- **${r.type}**: ${r.title}`
          ).join('\n')
        : "_No resources logged._";

    // Notes
    let notesSection = "_No specific notes recorded._";
    if (entry.topics && entry.topics.length > 0) {
        notesSection = entry.topics.map(t => `#### ${t.title}\n${t.notes}`).join('\n\n');
    } else if (entry.concepts && entry.concepts.length > 0) {
         // Fallback for older entries
        notesSection = `**Key Concepts:**\n${entry.concepts.map(c => `- ${c}`).join('\n')}`;
    }

    // Hands-On
    let handsOnSection = "";
    if (entry.activities && entry.activities.length > 0) {
         handsOnSection = entry.activities.map(a => `- [x] ${a}`).join('\n');
    } else if (entry.handsOnDescription) {
         handsOnSection = entry.handsOnDescription;
    } else {
         handsOnSection = "_No hands-on activity recorded._";
    }
    
    if (entry.handsOnCode) {
        handsOnSection += `\n\n**Snippet:**\n\`\`\`bash\n${entry.handsOnCode}\n\`\`\``;
    }

    return `# Week ${entry.week} Day ${entry.day}: ${entry.mainTopic}
**Date:** ${entry.date} | **Duration:** ${entry.duration}h | **Mood:** ${entry.mood}

### 🧠 Concepts & Notes
${notesSection}

### 💻 Hands-On
${handsOnSection}

### 📖 Resources Used
${resourcesSection}

### 📝 Reflections
> ${entry.reflection || "No reflection logged."}
`;
  };

  const copyToClipboard = (entry: NoteEntry) => {
    const md = generateMarkdown(entry);
    navigator.clipboard.writeText(md);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
      setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  // Custom Markdown Components for Study Session Cards (Compact)
  const markdownComponents = {
    h1: ({node, ...props}: any) => <h3 className="text-sm font-bold text-white mb-2 mt-3 border-b border-gray-700 pb-1" {...props} />,
    h2: ({node, ...props}: any) => <h4 className="text-xs font-bold text-blue-400 mt-3 mb-2" {...props} />,
    h3: ({node, ...props}: any) => <h5 className="text-xs font-bold text-purple-300 mt-2 mb-1" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-2 text-xs text-gray-300 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside mb-2 space-y-1 ml-1 text-xs text-gray-300" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-1 text-xs text-gray-300" {...props} />,
    li: ({node, ...props}: any) => <li className="pl-1" {...props} />,
    a: ({node, ...props}: any) => <a className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer" target="_blank" rel="noreferrer" {...props} />,
    strong: ({node, ...props}: any) => <span className="font-bold text-white" {...props} />,
    code: ({node, inline, className, children, ...props}: any) => {
        return inline ? (
            <code className="bg-gray-800 px-1 py-0.5 rounded text-[10px] font-mono text-green-300 border border-white/10" {...props}>{children}</code>
        ) : (
            <code className="block bg-transparent text-xs font-mono text-gray-300" {...props}>{children}</code>
        );
    },
  };

  // --- RENDER STEPS ---
  const StepHeader = ({ icon: Icon, title, desc, color }: any) => (
      <div className={`bg-${color}-500/10 border border-${color}-500/20 p-6 rounded-2xl mb-8 flex items-start gap-4 backdrop-blur-sm`}>
          <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <div>
              <h3 className={`font-bold text-${color}-100 text-lg`}>{title}</h3>
              <p className={`text-sm text-${color}-200/60`}>{desc}</p>
          </div>
      </div>
  );

  const renderStep = () => {
    const inputClasses = "w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500/50 focus:bg-black/40 focus:outline-none transition-all placeholder:text-gray-600";
    const labelClasses = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1";

    switch(currentStep) {
        case 1:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                    <StepHeader icon={Calendar} title="Session Logistics" desc="Set the scene. What are you tackling today?" color="blue" />
                    <div className="space-y-6">
                        <div>
                            <label className={labelClasses}>Main Topic / Title</label>
                            <input 
                                value={mainTopic} 
                                onChange={e => setMainTopic(e.target.value)} 
                                className={`${inputClasses} text-lg font-bold`} 
                                placeholder="e.g. Introduction to Cloud Computing"
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClasses}>Week</label>
                                <input type="number" min="1" value={week} onChange={e => setWeek(Number(e.target.value))} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Day</label>
                                <input type="number" min="1" max="7" value={day} onChange={e => setDay(Number(e.target.value))} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 2:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                    <StepHeader icon={Book} title="Knowledge Download" desc="Break down what you learned into structured notes." color="purple" />
                    <div className="space-y-6">
                        {topics.map((t, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 relative group">
                                <input 
                                    value={t.title} 
                                    onChange={e => handleTopicChange(i, 'title', e.target.value)} 
                                    className="w-full bg-transparent border-none p-0 text-white font-bold text-lg focus:ring-0 mb-2 placeholder:text-gray-600" 
                                    placeholder="Topic Title (e.g. Regions vs AZs)" 
                                />
                                <textarea 
                                    value={t.notes} 
                                    onChange={e => handleTopicChange(i, 'notes', e.target.value)} 
                                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-gray-300 text-sm h-32 focus:border-purple-500/50 focus:outline-none resize-none placeholder:text-gray-600" 
                                    placeholder="- Key point 1&#10;- Key point 2&#10;- Definition..." 
                                />
                                {topics.length > 1 && (
                                    <button onClick={() => {
                                        const newT = [...topics];
                                        newT.splice(i, 1);
                                        setTopics(newT);
                                    }} className="absolute top-4 right-4 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addTopic} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-400 hover:border-purple-500/50 hover:text-purple-400 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Add Topic Block
                        </button>
                    </div>
                </div>
            );
        case 3:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                     <StepHeader icon={Code} title="Practice & Challenges" desc="What did you actually DO? Did you break anything?" color="green" />

                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <label className={labelClasses}>Activity Checklist</label>
                            <div className="space-y-2 mb-4">
                                {activities.map((a, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <input 
                                            value={a} 
                                            onChange={e => handleActivityChange(i, e.target.value)} 
                                            className="flex-1 bg-transparent border-b border-white/10 py-2 text-white text-sm focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-600" 
                                            placeholder="e.g. Launched an EC2 instance" 
                                        />
                                    </div>
                                ))}
                            </div>
                            <button onClick={addActivity} className="text-xs text-green-400 flex items-center gap-1 hover:underline">+ Add Item</button>
                        </div>

                        <div>
                            <label className={labelClasses}>Code Snippet / Command</label>
                            <textarea value={handsOnCode} onChange={e => setHandsOnCode(e.target.value)} className={`${inputClasses} font-mono text-xs text-green-400 h-32`} placeholder="# Paste your best commands here..." />
                        </div>

                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                            <h4 className="font-bold text-red-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><AlertCircle className="w-4 h-4" /> The Struggle</h4>
                            <div className="space-y-4">
                                <input value={challengeProblem} onChange={e => setChallengeProblem(e.target.value)} className={`${inputClasses} bg-red-900/10 border-red-500/10 focus:border-red-500/50`} placeholder="Problem: What went wrong?" />
                                <input value={challengeSolution} onChange={e => setChallengeSolution(e.target.value)} className={`${inputClasses} bg-red-900/10 border-red-500/10 focus:border-red-500/50`} placeholder="Solution: How did you fix it?" />
                                <input value={challengeLearning} onChange={e => setChallengeLearning(e.target.value)} className={`${inputClasses} bg-red-900/10 border-red-500/10 focus:border-red-500/50`} placeholder="Learning: What is the takeaway?" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 4:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                    <StepHeader icon={Target} title="Insights & Resources" desc="Synthesize your learning and cite your sources." color="yellow" />

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Insights Column */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 h-fit">
                            <label className={labelClasses}>Top 3 Insights</label>
                            {takeaways.map((t, i) => (
                                <div key={i} className="flex gap-3 mb-4 last:mb-0 items-center">
                                    <span className="text-yellow-500 font-bold font-mono text-xl opacity-50">0{i+1}</span>
                                    <input 
                                        value={t} 
                                        onChange={e => handleArrayChange(setTakeaways, i, e.target.value)} 
                                        className="flex-1 bg-transparent border-b border-white/10 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-gray-600" 
                                        placeholder="Key insight..." 
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Resources Column (Redesigned) */}
                        <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <label className={labelClasses}>Resources Used</label>
                                <button onClick={addResource} className="text-xs text-yellow-400 flex items-center gap-1 hover:text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
                                    <Plus className="w-3 h-3" /> Add Resource
                                </button>
                             </div>
                             
                             {resources.map((r, i) => (
                                <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/10 relative group hover:bg-black/30 transition-colors">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Title Field */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Title</label>
                                            <input 
                                                value={r.title} 
                                                onChange={e => handleResourceChange(i, 'title', e.target.value)} 
                                                className="w-full bg-transparent border-b border-white/10 pb-1 text-white text-sm focus:border-yellow-500 outline-none placeholder:text-gray-700" 
                                                placeholder="e.g. AWS Official Documentation" 
                                            />
                                        </div>
                                        
                                        {/* Type Dropdown */}
                                        <div className="col-span-1">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Type</label>
                                            <select 
                                                value={r.type} 
                                                onChange={e => handleResourceChange(i, 'type', e.target.value)} 
                                                className="w-full bg-gray-900 border border-white/10 rounded-lg py-2 px-2 text-xs text-gray-300 focus:border-yellow-500 outline-none"
                                            >
                                                {RESOURCE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>

                                        {/* URL Field */}
                                        <div className="col-span-1">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">URL</label>
                                            <div className="flex items-center gap-2">
                                                <LinkIcon className="w-3 h-3 text-gray-500" />
                                                <input 
                                                    value={r.url} 
                                                    onChange={e => handleResourceChange(i, 'url', e.target.value)} 
                                                    className="w-full bg-transparent border-b border-white/10 pb-1 text-blue-400 text-xs focus:border-blue-500 outline-none placeholder:text-gray-700" 
                                                    placeholder="https://..." 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    {resources.length > 1 && (
                                        <button 
                                            onClick={() => removeResource(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                            title="Remove Resource"
                                        >
                                            <Trash className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            );
        case 5:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                    <StepHeader icon={Zap} title="Metrics & Plan" desc="Review yourself and plan for tomorrow." color="pink" />

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <label className={labelClasses}>Energy Level ({energy}/10)</label>
                            <input 
                                type="range" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))} 
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" 
                            />
                            
                            <label className={labelClasses}>Confidence ({confidence}/10)</label>
                            <input 
                                type="range" min="1" max="10" value={confidence} onChange={e => setConfidence(Number(e.target.value))} 
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                            />
                        </div>

                        <div className="space-y-4">
                            <label className={labelClasses}>Focus Level</label>
                            <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                                {['Low', 'Medium', 'High'].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setFocus(lvl as any)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                            focus === lvl 
                                            ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-lg' 
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className={labelClasses}>How did it feel?</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {MOODS.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMood(m.label)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${
                                        mood === m.label 
                                        ? `${m.bg} ring-2 ring-${m.color.split('-')[1]}-500/50 scale-105`
                                        : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                                    }`}
                                >
                                    <m.icon className={`w-6 h-6 mb-2 ${mood === m.label ? m.color : 'text-gray-500'}`} />
                                    <span className="text-[10px] font-bold">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        default: return null;
    }
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-xl border border-white/10">
                    <Book className="text-blue-400 w-6 h-6" />
                </span>
                Study Sessions
            </h2>
            <p className="text-gray-400 mt-1 ml-1 text-sm">Log your learning. Build your knowledge base.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <FocusTimer 
                ref={timerRef} 
                onPhaseComplete={handlePhaseComplete} 
                onTick={handleTimerTick} 
            />
            {!isEditing && (
                <button 
                    onClick={startSession}
                    className="group relative px-6 py-3 rounded-xl bg-blue-600 font-bold text-white overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Start Session
                    </span>
                </button>
            )}
        </div>
      </div>

      {isEditing ? (
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>

            {/* Main Content Area */}
            <div className="p-8 md:p-10 min-h-[500px]">
                {renderStep()}
            </div>

            {/* Footer Navigation */}
            <div className="bg-black/20 p-6 border-t border-white/5 flex justify-between items-center backdrop-blur-md">
                <button 
                    onClick={currentStep === 1 ? () => setIsEditing(false) : prevStep}
                    className="text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    {currentStep === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4" /> Back</>}
                </button>

                <div className="flex gap-4 items-center">
                    <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                            <div key={s} className={`w-2 h-2 rounded-full transition-all ${s === currentStep ? 'bg-white scale-125' : s < currentStep ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                        ))}
                    </div>

                    {currentStep < totalSteps ? (
                        <button 
                            onClick={nextStep}
                            className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                         <button 
                            onClick={handleSubmit}
                            className="bg-green-500 hover:bg-green-400 text-black px-8 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Complete Log
                        </button>
                    )}
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-4">
            {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                        <Book className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium">No sessions logged.</p>
                    <p className="text-gray-600 text-sm mt-1">Initialize your first study sequence.</p>
                </div>
            )}
            
            {entries.map((entry) => (
                <div key={entry.id} className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/5 group">
                    <div 
                        onClick={() => toggleExpand(entry.id)}
                        className="p-5 flex justify-between items-center cursor-pointer"
                    >
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">WK {entry.week}</div>
                                <div className="text-xl font-bold text-white font-mono">D{entry.day}</div>
                            </div>
                            
                            <div className="h-8 w-px bg-white/10"></div>
                            
                            <div>
                                <h4 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{entry.mainTopic}</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {entry.date}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {entry.duration}h</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                             <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                 entry.mood === 'Productive' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                 entry.mood === 'Excited' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                             }`}>
                                {entry.mood}
                             </div>
                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 transition-colors">
                                {expandedEntryId === entry.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                             </div>
                        </div>
                    </div>
                    
                    {expandedEntryId === entry.id && (
                        <div className="p-6 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 relative">
                            {/* Copy Button */}
                             <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(entry);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-400 hover:text-white transition-all group/btn"
                                >
                                    {copiedId === entry.id ? <CheckSquare className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 group-hover/btn:text-blue-400" />}
                                    {copiedId === entry.id ? 'Copied!' : 'Copy Markdown'}
                                </button>
                             </div>

                            {/* Detailed content display */}
                             <div className="grid md:grid-cols-2 gap-8 mt-4">
                                <div>
                                    <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Brain className="w-4 h-4"/> Knowledge</h5>
                                    <div className="space-y-4">
                                        {entry.topics?.map((t, i) => (
                                            <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                <div className="font-bold text-white text-sm mb-1">{t.title}</div>
                                                <div className="text-xs text-gray-400 leading-relaxed">
                                                    <ReactMarkdown components={markdownComponents}>{t.notes}</ReactMarkdown>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Code className="w-4 h-4"/> Practice & Resources</h5>
                                    {entry.handsOnCode && (
                                        <pre className="bg-black/40 rounded-lg p-3 text-xs font-mono text-gray-300 border border-white/10 overflow-x-auto mb-4">
                                            {entry.handsOnCode}
                                        </pre>
                                    )}
                                    <ul className="space-y-2 mb-4">
                                        {entry.activities?.map((a, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                <CheckSquare className="w-4 h-4 text-green-500/50" /> {a}
                                            </li>
                                        ))}
                                    </ul>
                                    {entry.resources && entry.resources.length > 0 && (
                                        <div className="pt-4 border-t border-white/10">
                                            <h6 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Resources</h6>
                                            <ul className="space-y-1">
                                                {entry.resources.map((r, i) => (
                                                    <li key={i} className="text-xs">
                                                        <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                                            <ExternalLink className="w-3 h-3" /> {r.title} <span className="text-gray-600">({r.type})</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}

      {/* Break Time Modal */}
      {showBreakModal && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
                  
                  <div className="mb-6 flex justify-center">
                      <div className={`p-6 rounded-full ${breakType === 'short' ? 'bg-green-500/20' : 'bg-blue-500/20'} animate-pulse`}>
                        {breakType === 'short' ? <Coffee className="w-12 h-12 text-green-400" /> : <Zap className="w-12 h-12 text-blue-400" />}
                      </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                      {breakType === 'short' ? 'Time for a Break!' : 'Back to Focus'}
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                      {breakType === 'short' 
                        ? 'Great work! Take 5 minutes to stretch, hydrate, or walk around. Your brain needs to recharge.' 
                        : 'Break is over. Let\'s get back into the flow state. You got this!'}
                  </p>

                  <button 
                    onClick={confirmBreakPhase}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                      {breakType === 'short' ? 'Start 5m Break' : 'Resume Session'}
                  </button>
              </div>
          </div>
      )}

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        xpEarned={50}
        score={sessionScore}
      />
    </div>
  );
};

export default StudySession;
