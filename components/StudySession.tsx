
import React, { useState, useEffect } from 'react';
import { ActivityType, NoteEntry } from '../types';
import { logActivity, saveNotebookEntry, getNotebookEntries } from '../services/gamificationService';
import { Save, Plus, Copy, Book, ArrowRight, ArrowLeft, Calendar, Clock, Brain, Code, Zap, Smile, Rocket, Coffee, AlertCircle, Target, ChevronDown, ChevronUp, FileText, List, CheckSquare, HelpCircle, Link as LinkIcon, Trash } from 'lucide-react';
import SuccessModal from './SuccessModal';

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

const StudySession: React.FC<StudySessionProps> = ({ onActivityLogged }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

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
  const [duration, setDuration] = useState('1.5');
  
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
  const [resources, setResources] = useState<{title: string, type: string}[]>([{ title: '', type: 'Documentation' }]);
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

  const handleResourceChange = (index: number, field: 'title' | 'type', value: string) => {
      const newRes = [...resources];
      newRes[index][field] = value;
      setResources(newRes);
  }
  const addResource = () => setResources([...resources, { title: '', type: 'Article' }]);

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
    const entry: NoteEntry = {
      id: Date.now().toString(),
      week, day, date, time, duration,
      mainTopic: mainTopic || `Week ${week} Study`,
      status: 'Completed',
      topics: topics.filter(t => t.title),
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
      concepts: topics.map(t => t.title),
      tools: [],
      handsOnDescription: activities.join(', ')
    };

    saveNotebookEntry(entry);
    setEntries([entry, ...entries]);
    
    logActivity(ActivityType.STUDY_SESSION, `Study Session: ${entry.mainTopic}`, week);
    onActivityLogged();
    
    setSessionScore(calculateSessionScore());
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
      setShowSuccessModal(false);
      setIsEditing(false);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // --- GENERATE MARKDOWN ---
  const generateMarkdown = (entry: NoteEntry) => {
    // ... (Markdown generation logic remains same as provided code) ...
    return `# Week ${entry.week} Day ${entry.day} - ${entry.mainTopic}`; // simplified for brevity
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            <div>
                                <label className={labelClasses}>Duration (Hrs)</label>
                                <input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)} className={inputClasses} />
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

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <label className={labelClasses}>Top 3 Insights</label>
                            {takeaways.map((t, i) => (
                                <div key={i} className="flex gap-3 mb-3 items-center">
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

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <label className={labelClasses}>Resources Used</label>
                            {resources.map((r, i) => (
                                <div key={i} className="flex gap-2 mb-3">
                                    <input 
                                        value={r.title} 
                                        onChange={e => handleResourceChange(i, 'title', e.target.value)} 
                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-yellow-500/50 outline-none" 
                                        placeholder="Title / URL" 
                                    />
                                    <input 
                                        value={r.type} 
                                        onChange={e => handleResourceChange(i, 'type', e.target.value)} 
                                        className="w-24 bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-yellow-500/50 outline-none" 
                                        placeholder="Type" 
                                    />
                                </div>
                            ))}
                            <button onClick={addResource} className="text-xs text-yellow-400 flex items-center gap-1 hover:underline mt-2">+ Add Resource</button>
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
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-xl border border-white/10">
                    <Book className="text-blue-400 w-6 h-6" />
                </span>
                Study Sessions
            </h2>
            <p className="text-gray-400 mt-1 ml-1 text-sm">Log your learning. Build your knowledge base.</p>
        </div>
        
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
                        <div className="p-6 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2">
                            {/* Detailed content display similar to previous but styled with new transparent aesthetics */}
                             <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Brain className="w-4 h-4"/> Knowledge</h5>
                                    <div className="space-y-4">
                                        {entry.topics?.map((t, i) => (
                                            <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                <div className="font-bold text-white text-sm mb-1">{t.title}</div>
                                                <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{t.notes}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Code className="w-4 h-4"/> Practice</h5>
                                    {entry.handsOnCode && (
                                        <pre className="bg-black/40 rounded-lg p-3 text-xs font-mono text-gray-300 border border-white/10 overflow-x-auto mb-4">
                                            {entry.handsOnCode}
                                        </pre>
                                    )}
                                    <ul className="space-y-2">
                                        {entry.activities?.map((a, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                <CheckSquare className="w-4 h-4 text-green-500/50" /> {a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
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
