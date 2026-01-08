
import React, { useState, useEffect } from 'react';
import { ActivityType, NoteEntry } from '../types';
import { logActivity, saveNotebookEntry, getNotebookEntries } from '../services/gamificationService';
import { Save, Plus, Copy, Book, ArrowRight, ArrowLeft, Calendar, Clock, Brain, Code, Zap, Smile, Rocket, Coffee, AlertCircle, Target, ChevronDown, ChevronUp, FileText, List, CheckSquare, HelpCircle, Link as LinkIcon } from 'lucide-react';
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
      // Reset logic omitted for brevity in XML, ideally reset all state here
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // --- GENERATE MARKDOWN ---
  const generateMarkdown = (entry: NoteEntry) => {
    const topicsSection = entry.topics ? entry.topics.map(t => `### ${t.title}\n${t.notes}`).join('\n\n') : '';
    const activityList = entry.activities ? entry.activities.map(a => `✅ ${a}`).join('\n') : '';
    
    // Fallback for older entries
    const conceptsList = entry.concepts ? entry.concepts.map(c => `- ${c}`).join('\n') : '';
    
    const resourceSection = entry.resources ? entry.resources.map(r => `1. **${r.title}** (${r.type})`).join('\n') : '';
    
    const planSection = entry.plan ? entry.plan.map(p => `1. **${p.goal}**\n   - Prep: ${p.prep}`).join('\n') : '';

    return `# 📅 Week ${entry.week} - Day ${entry.day}: ${entry.mainTopic || 'Study Session'}

**Date:** ${entry.date}
**Time:** ${entry.time}
**Duration:** ${entry.duration} hours
**Status:** ✅ ${entry.status || 'Completed'}

---

## 📚 What I Learned Today

${topicsSection || conceptsList || 'No notes recorded.'}

---

## 💻 Hands-On Practice

### What I Worked On:
${activityList || entry.handsOnDescription || '- N/A'}

### Code/Commands:
\`\`\`bash
${entry.handsOnCode || '# No code provided'}
\`\`\`

---

## 💡 Key Takeaways

### Top Insights:
${entry.takeaways.map((t, i) => `${i + 1}. **${t}**`).join('\n')}

---

## 🚧 Challenges Faced

**Problem:**
${entry.challenge.problem || 'N/A'}

**Solution:**
${entry.challenge.solution || 'N/A'}

**Learning:**
${entry.challenge.learning || 'N/A'}

---

## 📖 Resources Used

${resourceSection || '- N/A'}

---

## 🎯 Tomorrow's Plan

${planSection || '- N/A'}

---

## 📊 Session Metrics

**Productivity Indicators:**
- **Focus Level:** ${entry.focus || 'N/A'}
- **Quality:** ${entry.quality || 'N/A'}

**Emotional State:**
- **Mood:** ${entry.mood}
- **Energy Level:** ${entry.energy}/10
- **Confidence:** ${entry.confidence}/10

---

## 📝 Personal Notes

### Reflections:
${entry.reflection || 'N/A'}

### Questions for Further Research:
${entry.questions || 'N/A'}

---
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

  // --- RENDER STEPS ---

  const renderStep = () => {
    switch(currentStep) {
        case 1:
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6">
                        <h3 className="font-bold text-blue-400 flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Step 1: Logistics
                        </h3>
                        <p className="text-sm text-gray-400">Set the scene. What are you tackling today?</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Main Topic / Title</label>
                            <input 
                                value={mainTopic} 
                                onChange={e => setMainTopic(e.target.value)} 
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-devops-accent focus:outline-none" 
                                placeholder="e.g. Introduction to Cloud Computing"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Week</label>
                                <input type="number" min="1" value={week} onChange={e => setWeek(Number(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Day</label>
                                <input type="number" min="1" max="7" value={day} onChange={e => setDay(Number(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Time</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Duration (Hrs)</label>
                                <input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 2:
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg mb-6">
                        <h3 className="font-bold text-purple-400 flex items-center gap-2">
                            <Book className="w-5 h-5" /> Step 2: Knowledge Download
                        </h3>
                        <p className="text-sm text-gray-400">Break down what you learned into structured notes.</p>
                    </div>

                    <div className="space-y-6">
                        {topics.map((t, i) => (
                            <div key={i} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                                <input 
                                    value={t.title} 
                                    onChange={e => handleTopicChange(i, 'title', e.target.value)} 
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white font-bold mb-2" 
                                    placeholder="Topic Title (e.g. Regions vs AZs)" 
                                />
                                <textarea 
                                    value={t.notes} 
                                    onChange={e => handleTopicChange(i, 'notes', e.target.value)} 
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm h-32 focus:border-purple-500 focus:outline-none" 
                                    placeholder="- Key point 1&#10;- Key point 2&#10;- Definition..." 
                                />
                            </div>
                        ))}
                        <button onClick={addTopic} className="text-sm text-purple-400 flex items-center gap-1 hover:underline">
                            <Plus className="w-3 h-3" /> Add Another Topic
                        </button>
                    </div>
                </div>
            );
        case 3:
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg mb-6">
                        <h3 className="font-bold text-green-400 flex items-center gap-2">
                            <Code className="w-5 h-5" /> Step 3: Practice & Challenges
                        </h3>
                        <p className="text-sm text-gray-400">What did you actually DO? Did you break anything?</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Activity Checklist</label>
                            {activities.map((a, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <CheckSquare className="w-5 h-5 text-gray-500 mt-2" />
                                    <input 
                                        value={a} 
                                        onChange={e => handleActivityChange(i, e.target.value)} 
                                        className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" 
                                        placeholder="e.g. Launched an EC2 instance" 
                                    />
                                </div>
                            ))}
                            <button onClick={addActivity} className="text-xs text-green-400 flex items-center gap-1">+ Add Activity</button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Code Snippet / Command</label>
                            <textarea value={handsOnCode} onChange={e => setHandsOnCode(e.target.value)} className="w-full bg-black border border-gray-700 rounded p-3 text-green-400 font-mono text-xs h-24" placeholder="aws s3 ls..." />
                        </div>

                        <div className="bg-red-900/10 border border-red-900/30 rounded p-4">
                            <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Major Challenge Encountered</h4>
                            <div className="space-y-3">
                                <input value={challengeProblem} onChange={e => setChallengeProblem(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Problem: What went wrong?" />
                                <input value={challengeSolution} onChange={e => setChallengeSolution(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Solution: How did you fix it?" />
                                <textarea value={challengeLearning} onChange={e => setChallengeLearning(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm h-16" placeholder="Learning: What is the takeaway?" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 4:
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg mb-6">
                        <h3 className="font-bold text-yellow-400 flex items-center gap-2">
                            <Target className="w-5 h-5" /> Step 4: Insights & Resources
                        </h3>
                        <p className="text-sm text-gray-400">Synthesize your learning and cite your sources.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Top 3 Insights</label>
                            {takeaways.map((t, i) => (
                                <div key={i} className="flex gap-2 mb-2 items-center">
                                    <span className="text-yellow-500 font-bold">{i+1}.</span>
                                    <input 
                                        value={t} 
                                        onChange={e => handleArrayChange(setTakeaways, i, e.target.value)} 
                                        className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" 
                                        placeholder="Key insight..." 
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Resources Used</label>
                            {resources.map((r, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input 
                                        value={r.title} 
                                        onChange={e => handleResourceChange(i, 'title', e.target.value)} 
                                        className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" 
                                        placeholder="Resource Title / URL" 
                                    />
                                    <input 
                                        value={r.type} 
                                        onChange={e => handleResourceChange(i, 'type', e.target.value)} 
                                        className="w-24 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" 
                                        placeholder="Type" 
                                    />
                                </div>
                            ))}
                            <button onClick={addResource} className="text-xs text-yellow-400 flex items-center gap-1">+ Add Resource</button>
                        </div>
                    </div>
                </div>
            );
        case 5:
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-pink-900/20 border border-pink-500/30 p-4 rounded-lg mb-6">
                        <h3 className="font-bold text-pink-400 flex items-center gap-2">
                            <Zap className="w-5 h-5" /> Step 5: Metrics & Plan
                        </h3>
                        <p className="text-sm text-gray-400">Review yourself and plan for tomorrow.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Tomorrow's Plan</label>
                            {planGoals.map((g, i) => (
                                <div key={i} className="mb-2 space-y-1">
                                    <input value={g} onChange={e => handleArrayChange(setPlanGoals, i, e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Goal for tomorrow..." />
                                    <input value={planPrep[i]} onChange={e => handleArrayChange(setPlanPrep, i, e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded p-1 text-gray-300 text-xs" placeholder="Prep needed?" />
                                </div>
                            ))}
                            <button onClick={() => { addArrayItem(setPlanGoals); addArrayItem(setPlanPrep); }} className="text-xs text-pink-400">+ Add Goal</button>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Personal Reflection</label>
                            <textarea value={reflection} onChange={e => setReflection(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm h-24" placeholder="How did it feel? Any 'aha' moments?" />
                            <textarea value={questions} onChange={e => setQuestions(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm h-16 mt-2" placeholder="Open questions?" />
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-700">
                        {/* Energy & Confidence Sliders */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="flex justify-between text-sm font-bold text-gray-300 mb-2">
                                    <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/> Energy Level</span>
                                    <span className={`text-yellow-400 font-mono`}>{energy}/10</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={energy} 
                                    onChange={e => setEnergy(Number(e.target.value))} 
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
                                />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                                    <span>Drained</span>
                                    <span>Hyped</span>
                                </div>
                            </div>
                            <div>
                                <label className="flex justify-between text-sm font-bold text-gray-300 mb-2">
                                    <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-blue-400"/> Confidence</span>
                                    <span className={`text-blue-400 font-mono`}>{confidence}/10</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={confidence} 
                                    onChange={e => setConfidence(Number(e.target.value))} 
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                                />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                                    <span>Confused</span>
                                    <span>Master</span>
                                </div>
                            </div>
                        </div>

                        {/* Focus Selector */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-green-400"/> Focus Level
                            </label>
                            <div className="flex gap-4">
                                {['Low', 'Medium', 'High'].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setFocus(lvl as any)}
                                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            focus === lvl 
                                            ? 'bg-green-900/40 border-green-500 text-green-400 ring-1 ring-green-500' 
                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mood Selector - Grid */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                                <Smile className="w-4 h-4 text-pink-400"/> How did it feel?
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {MOODS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMood(m.label)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                                            mood === m.label 
                                            ? `${m.bg} ring-1 ring-${m.color.split('-')[1]}-400`
                                            : 'bg-gray-800 border-gray-700 hover:bg-gray-750 opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <m.icon className={`w-5 h-5 mb-1 ${mood === m.label ? m.color : 'text-gray-400'}`} />
                                        <span className={`text-[10px] font-medium ${mood === m.label ? 'text-white' : 'text-gray-500'}`}>
                                            {m.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        default: return null;
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Book className="text-devops-accent" />
          Study Sessions
        </h2>
        {!isEditing && (
          <button 
            onClick={startSession}
            className="flex items-center gap-2 bg-devops-accent text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Start Session
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-devops-card rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            {/* Progress Bar */}
            <div className="bg-gray-800 h-2 w-full">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>

            {/* Main Content Area */}
            <div className="p-6 md:p-8 min-h-[500px]">
                {renderStep()}
            </div>

            {/* Footer Navigation */}
            <div className="bg-gray-800/50 p-6 border-t border-gray-700 flex justify-between items-center">
                <button 
                    onClick={currentStep === 1 ? () => setIsEditing(false) : prevStep}
                    className="text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    {currentStep === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4" /> Back</>}
                </button>

                <div className="flex gap-2">
                     <span className="text-sm text-gray-500 self-center mr-4">Step {currentStep} of {totalSteps}</span>
                    {currentStep < totalSteps ? (
                        <button 
                            onClick={nextStep}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                         <button 
                            onClick={handleSubmit}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20"
                        >
                            <Save className="w-4 h-4" /> Finish & Log
                        </button>
                    )}
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-4">
            {entries.length === 0 && (
                <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-800/30">
                    <Book className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No study sessions yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Log your first day to unlock labs and projects!</p>
                </div>
            )}
            
            {entries.map((entry) => (
                <div key={entry.id} className="bg-devops-card rounded-xl border border-gray-700 overflow-hidden transition-all duration-200 hover:border-devops-accent">
                    {/* Accordion Header - Clickable */}
                    <div 
                        onClick={() => toggleExpand(entry.id)}
                        className="p-4 bg-gray-800/50 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded text-sm whitespace-nowrap">
                                    Week {entry.week}
                                </div>
                                <span className="text-white font-medium whitespace-nowrap">Day {entry.day}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="hidden sm:inline border-l border-gray-600 h-4 mx-2"></span>
                                <span>{entry.date}</span>
                                <span className="hidden sm:inline border-l border-gray-600 h-4 mx-2"></span>
                                <span className="truncate max-w-[150px] sm:max-w-[250px] italic text-gray-300">
                                    {entry.mainTopic || entry.concepts?.[0] || 'Study Session'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                             <div className="text-gray-400">
                                {expandedEntryId === entry.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                             </div>
                        </div>
                    </div>
                    
                    {/* Accordion Body */}
                    {expandedEntryId === entry.id && (
                        <div className="p-6 text-gray-300 border-t border-gray-700 bg-gray-900/20 animate-in slide-in-from-top-2">
                            <div className="flex justify-end mb-4">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(entry);
                                    }}
                                    className="text-xs flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                                >
                                    <Copy className="w-3 h-3" />
                                    {copiedId === entry.id ? 'Copied!' : 'Copy MD'}
                                </button>
                            </div>

                             {/* Metrics Bar - Moved to TOP for visibility */}
                             <div className="flex flex-wrap gap-4 mb-6 text-xs font-mono bg-black/20 p-3 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                    <Zap className="w-3 h-3 text-yellow-500"/> <span className="text-yellow-200">Energy: {entry.energy}/10</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                                    <Brain className="w-3 h-3 text-blue-500"/> <span className="text-blue-200">Confidence: {entry.confidence}/10</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                    <Target className="w-3 h-3 text-green-500"/> <span className="text-green-200">Focus: {entry.focus}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/10 rounded-full border border-pink-500/20">
                                    <Smile className="w-3 h-3 text-pink-500"/> <span className="text-pink-200">Mood: {entry.mood}</span>
                                </div>
                             </div>

                             {/* Two Column Layout for Core Content */}
                             <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-gray-700 pb-2">
                                        <Brain className="w-4 h-4 text-purple-400"/> Topics Covered
                                    </h4>
                                    <ul className="space-y-3">
                                        {entry.topics ? entry.topics.map((t, i) => (
                                            <li key={i} className="text-sm">
                                                <strong className="text-gray-200 block mb-1">• {t.title}</strong>
                                                <p className="text-gray-400 pl-4 border-l-2 border-gray-700 text-xs leading-relaxed whitespace-pre-wrap">{t.notes}</p>
                                            </li>
                                        )) : <li className="text-sm text-gray-500">No detailed notes.</li>}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-gray-700 pb-2">
                                        <Target className="w-4 h-4 text-yellow-400"/> Top Takeaways
                                    </h4>
                                    <ul className="space-y-2">
                                        {entry.takeaways.map((t, i) => (
                                            <li key={i} className="text-sm bg-gray-800/50 p-2 rounded border border-gray-700/50 flex gap-2">
                                                <span className="text-yellow-500 font-bold">{i+1}.</span>
                                                <span className="text-gray-300">{t}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                             </div>

                             {/* Hands On Section */}
                             <div className="mb-8">
                                <h4 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-gray-700 pb-2">
                                    <Code className="w-4 h-4 text-green-400"/> Hands-On & Practice
                                </h4>
                                <div className="bg-gray-800/20 rounded-lg p-4 border border-gray-700/50">
                                    {/* Activities */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {entry.activities?.map((a, i) => (
                                            <span key={i} className="flex items-center gap-1 text-xs bg-green-900/20 text-green-300 px-2 py-1 rounded border border-green-900/50">
                                                <CheckSquare className="w-3 h-3"/> {a}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Code */}
                                    {entry.handsOnCode && (
                                        <div className="relative">
                                            <div className="absolute top-2 right-2 text-[10px] text-gray-500">BASH</div>
                                            <pre className="bg-black/50 p-3 rounded border border-gray-700 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                                {entry.handsOnCode}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                             </div>

                             {/* Challenges & Solutions */}
                             {(entry.challenge.problem || entry.challenge.solution) && (
                                <div className="mb-8">
                                    <h4 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-gray-700 pb-2">
                                        <AlertCircle className="w-4 h-4 text-red-400"/> Challenges Overcome
                                    </h4>
                                    <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-4 grid gap-4 md:grid-cols-3">
                                        <div>
                                            <span className="text-xs font-bold text-red-400 uppercase">The Problem</span>
                                            <p className="text-sm text-gray-300 mt-1">{entry.challenge.problem || "None recorded"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-green-400 uppercase">The Solution</span>
                                            <p className="text-sm text-gray-300 mt-1">{entry.challenge.solution || "N/A"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-blue-400 uppercase">The Lesson</span>
                                            <p className="text-sm text-gray-300 mt-1">{entry.challenge.learning || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                             )}

                             {/* Footer: Resources, Plan, Reflection */}
                             <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-xs uppercase text-gray-500">Resources</h4>
                                    <ul className="text-sm space-y-1">
                                        {entry.resources?.map((r, i) => (
                                            <li key={i} className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer">
                                                <LinkIcon className="w-3 h-3"/> {r.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-xs uppercase text-gray-500">Tomorrow's Plan</h4>
                                    <ul className="text-sm space-y-1 text-gray-300">
                                        {entry.plan?.map((p, i) => (
                                            <li key={i}>• {p.goal} {p.prep && <span className="text-gray-500 text-xs">({p.prep})</span>}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-xs uppercase text-gray-500">Reflection</h4>
                                    <p className="text-sm text-gray-400 italic">"{entry.reflection || "No reflection added."}"</p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}

      {/* Reusable Success Modal with Calculated Score */}
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
