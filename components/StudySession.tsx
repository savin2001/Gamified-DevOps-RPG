
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

// Corporate Mood Palette
const MOODS = [
  { id: 'productive', label: 'Productive', score: 10, icon: Zap, color: 'text-gold-600 dark:text-gold-400', bg: 'bg-gold-50 dark:bg-gold-900/10 border-gold-200 dark:border-gold-800' },
  { id: 'curious', label: 'Curious', score: 9, icon: Brain, color: 'text-navy-600 dark:text-navy-400', bg: 'bg-navy-50 dark:bg-navy-900/10 border-navy-200 dark:border-navy-800' },
  { id: 'excited', label: 'Excited', score: 10, icon: Rocket, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800' },
  { id: 'neutral', label: 'Neutral', score: 6, icon: Smile, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-700' },
  { id: 'tired', label: 'Tired', score: 4, icon: Coffee, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800' },
  { id: 'frustrated', label: 'Frustrated', score: 3, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' },
];

const RESOURCE_TYPES = ['Documentation', 'Video', 'Article', 'Course', 'GitHub Repo', 'Tool'];

const StudySession: React.FC<StudySessionProps> = ({ onActivityLogged }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const timerRef = useRef<FocusTimerHandle>(null);
  const [trackedSeconds, setTrackedSeconds] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakType, setBreakType] = useState<'short' | 'long'>('short');

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);

  // --- FORM STATE ---
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(1);
  const [mainTopic, setMainTopic] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState('1.5'); 
  
  const [topics, setTopics] = useState<{title: string, notes: string}[]>([{ title: '', notes: '' }]);
  const [activities, setActivities] = useState<string[]>(['Watched course video', 'Read documentation']);
  const [handsOnCode, setHandsOnCode] = useState('');
  const [challengeProblem, setChallengeProblem] = useState('');
  const [challengeSolution, setChallengeSolution] = useState('');
  const [challengeLearning, setChallengeLearning] = useState('');

  const [takeaways, setTakeaways] = useState<string[]>(['', '', '']);
  const [resources, setResources] = useState<{title: string, url: string, type: string}[]>([{ title: '', url: '', type: 'Documentation' }]);
  const [planGoals, setPlanGoals] = useState<string[]>(['']);
  const [planPrep, setPlanPrep] = useState<string[]>(['']);

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
      setTrackedSeconds(0);
      setDuration('1.5'); 
      setTimeout(() => {
          if (timerRef.current) {
              timerRef.current.reset();
              timerRef.current.start();
          }
      }, 100);
  };

  const handlePhaseComplete = (completedMode: 'focus' | 'break') => {
      if (completedMode === 'focus') {
          setBreakType('short');
          setShowBreakModal(true);
      } else {
          setShowBreakModal(true); 
          setBreakType('long'); 
      }
  };

  const confirmBreakPhase = () => {
      setShowBreakModal(false);
      if (timerRef.current) {
          if (breakType === 'short') {
            timerRef.current.setMode('break');
          } else {
            timerRef.current.setMode('focus');
          }
      }
  };

  const handleTimerTick = (seconds: number) => {
      setTrackedSeconds(seconds);
      if (seconds > 300) {
          const hours = (seconds / 3600).toFixed(1);
          setDuration(hours);
      }
  };

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

  const calculateSessionScore = () => {
      const energyScore = energy * 10;
      const confidenceScore = confidence * 10;
      const selectedMood = MOODS.find(m => m.label === mood);
      const moodScore = (selectedMood?.score || 5) * 10;
      const focusBonus = focus === 'High' ? 10 : focus === 'Low' ? -10 : 0;
      const finalScore = (energyScore * 0.3) + (confidenceScore * 0.4) + (moodScore * 0.3) + focusBonus;
      return Math.min(Math.max(Math.round(finalScore), 0), 100);
  };

  const handleSubmit = () => {
    const finalDuration = trackedSeconds > 600 ? (trackedSeconds / 3600).toFixed(1) : duration;
    const entry: NoteEntry = {
      id: Date.now().toString(),
      week, day, date, time, 
      duration: finalDuration,
      mainTopic: mainTopic || `Week ${week} Study`,
      status: 'Completed',
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
    
    if (timerRef.current) timerRef.current.pause();
  };

  const closeSuccessModal = () => {
      setShowSuccessModal(false);
      setIsEditing(false);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const copyToClipboard = (entry: NoteEntry) => {
    const md = `# Week ${entry.week} Day ${entry.day}\n...`; // Simplified for brevity
    navigator.clipboard.writeText(md);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
      setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const StepHeader = ({ icon: Icon, title, desc, color }: any) => (
      <div className={`bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 p-6 rounded-xl mb-8 flex items-start gap-4`}>
          <div className={`p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30`}>
            <Icon className={`w-6 h-6 text-navy-700 dark:text-navy-300`} />
          </div>
          <div>
              <h3 className={`font-bold text-navy-900 dark:text-white text-lg`}>{title}</h3>
              <p className={`text-sm text-slate-500 dark:text-slate-400`}>{desc}</p>
          </div>
      </div>
  );

  const inputClasses = "w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600";
  const labelClasses = "block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1";

  const renderStep = () => {
    switch(currentStep) {
        case 1:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                    <StepHeader icon={Calendar} title="Session Logistics" desc="Set the scene. What are you tackling today?" />
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
                    <StepHeader icon={Book} title="Knowledge Download" desc="Break down what you learned into structured notes." />
                    <div className="space-y-6">
                        {topics.map((t, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5 relative group">
                                <input 
                                    value={t.title} 
                                    onChange={e => handleTopicChange(i, 'title', e.target.value)} 
                                    className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 mb-2 placeholder:text-slate-400" 
                                    placeholder="Topic Title (e.g. Regions vs AZs)" 
                                />
                                <textarea 
                                    value={t.notes} 
                                    onChange={e => handleTopicChange(i, 'notes', e.target.value)} 
                                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg p-3 text-slate-600 dark:text-gray-300 text-sm h-32 focus:border-brand-500 focus:outline-none resize-none" 
                                    placeholder="- Key point 1&#10;- Key point 2&#10;- Definition..." 
                                />
                                {topics.length > 1 && (
                                    <button onClick={() => {
                                        const newT = [...topics];
                                        newT.splice(i, 1);
                                        setTopics(newT);
                                    }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addTopic} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Add Topic Block
                        </button>
                    </div>
                </div>
            );
        case 3:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                     <StepHeader icon={Code} title="Practice & Challenges" desc="What did you actually DO? Did you break anything?" />

                    <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 border border-slate-200 dark:border-white/5">
                            <label className={labelClasses}>Activity Checklist</label>
                            <div className="space-y-2 mb-4">
                                {activities.map((a, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                                        <input 
                                            value={a} 
                                            onChange={e => handleActivityChange(i, e.target.value)} 
                                            className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors" 
                                            placeholder="e.g. Launched an EC2 instance" 
                                        />
                                    </div>
                                ))}
                            </div>
                            <button onClick={addActivity} className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">+ Add Item</button>
                        </div>

                        <div>
                            <label className={labelClasses}>Code Snippet / Command</label>
                            <textarea value={handsOnCode} onChange={e => setHandsOnCode(e.target.value)} className={`${inputClasses} font-mono text-xs h-32`} placeholder="# Paste your best commands here..." />
                        </div>
                    </div>
                </div>
            );
        case 4:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                    <StepHeader icon={Target} title="Insights & Resources" desc="Synthesize your learning and cite your sources." />

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/5 h-fit">
                            <label className={labelClasses}>Top 3 Insights</label>
                            {takeaways.map((t, i) => (
                                <div key={i} className="flex gap-3 mb-4 last:mb-0 items-center">
                                    <span className="text-gold-500 font-bold font-mono text-xl opacity-50">0{i+1}</span>
                                    <input 
                                        value={t} 
                                        onChange={e => handleArrayChange(setTakeaways, i, e.target.value)} 
                                        className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-gold-500 transition-colors" 
                                        placeholder="Key insight..." 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 5:
            return (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                    <StepHeader icon={Zap} title="Metrics & Plan" desc="Review yourself and plan for tomorrow." />

                    <div className="mb-8">
                        <label className={labelClasses}>How did it feel?</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {MOODS.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMood(m.label)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                                        mood === m.label 
                                        ? `${m.bg} shadow-sm`
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-white/10'
                                    }`}
                                >
                                    <m.icon className={`w-6 h-6 mb-2 ${mood === m.label ? m.color : 'text-slate-400 dark:text-gray-500'}`} />
                                    <span className={`text-[10px] font-bold ${mood === m.label ? 'text-slate-900 dark:text-white' : ''}`}>{m.label}</span>
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-navy-50 dark:bg-navy-900/30 rounded-xl border border-navy-100 dark:border-navy-800">
                    <Book className="text-navy-600 dark:text-navy-400 w-6 h-6" />
                </span>
                Study Sessions
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mt-1 ml-1 text-sm">Log your learning. Build your knowledge base.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <FocusTimer 
                ref={timerRef} 
                initialMinutes={25}
                enablePomodoro={true}
                onPhaseComplete={handlePhaseComplete} 
                onTick={handleTimerTick} 
            />
            {!isEditing && (
                <button 
                    onClick={startSession}
                    className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-md transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Start Session
                </button>
            )}
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-surface-cardDark rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-white/5">
                <div 
                    className="h-full bg-brand-500 transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>

            <div className="p-8 md:p-10 min-h-[500px]">
                {renderStep()}
            </div>

            <div className="bg-slate-50 dark:bg-black/10 p-6 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                <button 
                    onClick={currentStep === 1 ? () => setIsEditing(false) : prevStep}
                    className="text-slate-500 hover:text-navy-900 dark:text-gray-400 dark:hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    {currentStep === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4" /> Back</>}
                </button>

                <div className="flex gap-4 items-center">
                    {currentStep < totalSteps ? (
                        <button 
                            onClick={nextStep}
                            className="bg-navy-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-colors flex items-center gap-2"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                         <button 
                            onClick={handleSubmit}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2"
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
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Book className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                    </div>
                    <p className="text-slate-500 dark:text-gray-400 text-lg font-medium">No sessions logged.</p>
                    <p className="text-slate-400 dark:text-gray-600 text-sm mt-1">Initialize your first study sequence.</p>
                </div>
            )}
            
            {entries.map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all hover:shadow-md group">
                    <div 
                        onClick={() => toggleExpand(entry.id)}
                        className="p-5 flex justify-between items-center cursor-pointer"
                    >
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">WK {entry.week}</div>
                                <div className="text-xl font-bold text-navy-900 dark:text-white font-mono">D{entry.day}</div>
                            </div>
                            
                            <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
                            
                            <div>
                                <h4 className="text-navy-900 dark:text-white font-bold text-lg group-hover:text-brand-600 transition-colors">{entry.mainTopic}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {entry.date}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {entry.duration}h</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                             <div className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                {entry.mood}
                             </div>
                             <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                {expandedEntryId === entry.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                             </div>
                        </div>
                    </div>
                    
                    {expandedEntryId === entry.id && (
                        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/10 animate-in slide-in-from-top-2 relative">
                             {/* ... details content ... */}
                             <div className="text-sm text-slate-600 dark:text-slate-400">
                                <p><strong>Key Concepts:</strong> {entry.topics.map(t => t.title).join(', ')}</p>
                                <p className="mt-2"><strong>Reflection:</strong> {entry.reflection || 'No notes.'}</p>
                             </div>
                        </div>
                    )}
                </div>
            ))}
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
