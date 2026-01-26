
import React, { useState, useEffect } from 'react';
import { ActivityType, NoteEntry } from '../types';
import { logActivity, saveNotebookEntry, getNotebookEntries } from '../services/gamificationService';
import { Save, Plus, Copy, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface NotebookProps {
  onActivityLogged: () => void;
}

const Notebook: React.FC<NotebookProps> = ({ onActivityLogged }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState('1.5');
  const [concepts, setConcepts] = useState(['']);
  const [tools, setTools] = useState(['']);
  const [handsOnDesc, setHandsOnDesc] = useState('');
  const [handsOnCode, setHandsOnCode] = useState('');
  const [takeaways, setTakeaways] = useState(['']);
  const [challengeProblem, setChallengeProblem] = useState('');
  const [challengeSolution, setChallengeSolution] = useState('');
  const [challengeLearning, setChallengeLearning] = useState('');
  const [resources, setResources] = useState(['']);
  const [plan, setPlan] = useState(['']);
  const [mood, setMood] = useState('Productive');
  const [energy, setEnergy] = useState(7);
  const [confidence, setConfidence] = useState(7);

  useEffect(() => {
    setEntries(getNotebookEntries());
  }, []);

  const handleArrayChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    index: number, 
    value: string
  ) => {
    setter(prev => {
      const newArr = [...prev];
      newArr[index] = value;
      return newArr;
    });
  };

  const addArrayField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: NoteEntry = {
      id: Date.now().toString(),
      week, day, date, time, duration,
      
      // Default required fields for legacy Notebook component compatibility
      mainTopic: concepts[0] || 'Study Session',
      status: 'Completed',
      topics: [],
      activities: [],
      quality: 'Average',
      focus: 'Medium',
      reflection: '',
      questions: '',

      concepts: concepts.filter(c => c),
      tools: tools.filter(t => t),
      handsOnDescription: handsOnDesc,
      handsOnCode,
      takeaways: takeaways.filter(t => t),
      challenge: {
        problem: challengeProblem,
        solution: challengeSolution,
        learning: challengeLearning
      },
      resources: resources.filter(r => r).map(r => ({ title: r, url: '', type: 'Link' })),
      plan: plan.filter(p => p).map(p => ({ goal: p, prep: '' })),
      mood, energy, confidence
    };

    saveNotebookEntry(entry);
    setEntries([entry, ...entries]);
    
    // Gamification
    logActivity(ActivityType.STUDY_SESSION, `Notebook Entry: Week ${week} Day ${day}`);
    onActivityLogged();
    
    setIsEditing(false);
    resetForm();
  };

  const resetForm = () => {
    setConcepts(['']);
    setTools(['']);
    setTakeaways(['']);
    setResources(['']);
    setPlan(['']);
    setHandsOnDesc('');
    setHandsOnCode('');
    setChallengeProblem('');
    setChallengeSolution('');
    setChallengeLearning('');
  };

  const generateMarkdown = (entry: NoteEntry) => {
    return `# 📅 Week ${entry.week} - Day ${entry.day}

**Date:** ${entry.date}
**Time:** ${entry.time}
**Duration:** ${entry.duration} hours

---

## 📚 What I Learned Today

### Key Concepts:
${entry.concepts ? entry.concepts.map(c => `- ${c}`).join('\n') : ''}

### New Tools/Technologies:
${entry.tools ? entry.tools.map(t => `- ${t}`).join('\n') : ''}

---

## 💻 Hands-On Practice

### What I Built:
${entry.handsOnDescription}

### Code/Commands:
\`\`\`bash
${entry.handsOnCode}
\`\`\`

---

## 💡 Key Takeaways

${entry.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}

---

## 🚧 Challenges Faced

**Challenge:** ${entry.challenge.problem}
**Solution:** ${entry.challenge.solution}
**Learning:** ${entry.challenge.learning}

---

## 📖 Resources Used

${entry.resources.map(r => `- ${r.title}`).join('\n')}

---

## 🎯 Tomorrow's Plan

${entry.plan.map(p => `- ${p.goal}`).join('\n')}

---

**Mood:** ${entry.mood}
**Energy Level:** ${entry.energy}/10
**Confidence:** ${entry.confidence}/10
`;
  };

  const copyToClipboard = (entry: NoteEntry) => {
    const md = generateMarkdown(entry);
    navigator.clipboard.writeText(md);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const inputClasses = "w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white mb-2 focus:border-brand-500 focus:outline-none transition-colors";
  const labelClasses = "block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
          <FileText className="text-brand-600 dark:text-brand-400" />
          Learning Journal
        </h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-cardDark rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClasses}>Week</label>
              <input type="number" value={week} onChange={e => setWeek(Number(e.target.value))} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Day</label>
              <input type="number" value={day} onChange={e => setDay(Number(e.target.value))} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Duration (Hrs)</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className={inputClasses} />
            </div>
          </div>

          {/* Concepts & Tools */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Key Concepts</label>
              {concepts.map((c, i) => (
                <input key={i} value={c} onChange={e => handleArrayChange(setConcepts, i, e.target.value)} className={inputClasses} placeholder="Concept..." />
              ))}
              <button type="button" onClick={() => addArrayField(setConcepts)} className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">+ Add Concept</button>
            </div>
            <div>
              <label className={labelClasses}>New Tools</label>
              {tools.map((t, i) => (
                <input key={i} value={t} onChange={e => handleArrayChange(setTools, i, e.target.value)} className={inputClasses} placeholder="Tool..." />
              ))}
              <button type="button" onClick={() => addArrayField(setTools)} className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">+ Add Tool</button>
            </div>
          </div>

          {/* Hands On */}
          <div className="space-y-4 border-t border-slate-200 dark:border-white/10 pt-4">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Hands-On Practice</h3>
            <textarea value={handsOnDesc} onChange={e => setHandsOnDesc(e.target.value)} className={`${inputClasses} h-24`} placeholder="What did you build?" />
            <textarea value={handsOnCode} onChange={e => setHandsOnCode(e.target.value)} className={`${inputClasses} font-mono text-xs h-32`} placeholder="# Paste commands or code here..." />
          </div>

          {/* Challenges */}
          <div className="space-y-4 border-t border-slate-200 dark:border-white/10 pt-4">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Challenges</h3>
            <input value={challengeProblem} onChange={e => setChallengeProblem(e.target.value)} className={inputClasses} placeholder="The Challenge..." />
            <input value={challengeSolution} onChange={e => setChallengeSolution(e.target.value)} className={inputClasses} placeholder="The Solution..." />
            <input value={challengeLearning} onChange={e => setChallengeLearning(e.target.value)} className={inputClasses} placeholder="What did you learn from this?" />
          </div>

          {/* Takeaways, Resources, Plan */}
          <div className="grid md:grid-cols-3 gap-4 border-t border-slate-200 dark:border-white/10 pt-4">
             <div>
                <label className={labelClasses}>Key Takeaways</label>
                {takeaways.map((item, i) => (
                  <input key={i} value={item} onChange={e => handleArrayChange(setTakeaways, i, e.target.value)} className={inputClasses} />
                ))}
                <button type="button" onClick={() => addArrayField(setTakeaways)} className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">+ Add</button>
             </div>
             <div>
                <label className={labelClasses}>Resources</label>
                {resources.map((item, i) => (
                  <input key={i} value={item} onChange={e => handleArrayChange(setResources, i, e.target.value)} className={inputClasses} />
                ))}
                <button type="button" onClick={() => addArrayField(setResources)} className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">+ Add</button>
             </div>
             <div>
                <label className={labelClasses}>Tomorrow's Plan</label>
                {plan.map((item, i) => (
                  <input key={i} value={item} onChange={e => handleArrayChange(setPlan, i, e.target.value)} className={inputClasses} />
                ))}
                <button type="button" onClick={() => addArrayField(setPlan)} className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">+ Add</button>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-white/10 pt-4">
             <input value={mood} onChange={e => setMood(e.target.value)} className={inputClasses} placeholder="Mood" />
             <input type="number" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))} className={inputClasses} placeholder="Energy (1-10)" />
             <input type="number" min="1" max="10" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className={inputClasses} placeholder="Confidence (1-10)" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white font-medium">Cancel</button>
            <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2 font-bold shadow-md transition-colors">
              <Save className="w-4 h-4" /> Save & Log XP
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-6">
            {entries.length === 0 && <p className="text-slate-500 dark:text-gray-500 text-center py-12">No entries yet. Start your journal!</p>}
            
            {entries.map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-surface-cardDark rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-navy-900 dark:text-white">Week {entry.week} - Day {entry.day}</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 dark:text-gray-400">{entry.date}</span>
                            <button 
                                onClick={() => copyToClipboard(entry)}
                                className="text-xs flex items-center gap-1 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 transition-colors font-medium"
                            >
                                <Copy className="w-3 h-3" />
                                {copiedId === entry.id ? 'Copied!' : 'Copy MD'}
                            </button>
                        </div>
                    </div>
                    <div className="p-6 text-slate-600 dark:text-gray-300 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-brand-600 dark:text-brand-400 font-bold mb-2 text-sm uppercase tracking-wide">Learned Today</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {entry.concepts ? entry.concepts.map((c, i) => <li key={i}>{c}</li>) : null}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-brand-600 dark:text-brand-400 font-bold mb-2 text-sm uppercase tracking-wide">Challenge & Solution</h4>
                                <p className="text-sm"><span className="text-red-500 font-bold">Problem:</span> {entry.challenge.problem}</p>
                                <p className="text-sm mt-1"><span className="text-emerald-500 font-bold">Fix:</span> {entry.challenge.solution}</p>
                            </div>
                        </div>
                        
                        {entry.handsOnCode && (
                            <div className="bg-slate-900 dark:bg-black/50 p-4 rounded-xl font-mono text-sm border border-slate-800 dark:border-white/5 shadow-inner">
                                <pre className="whitespace-pre-wrap text-emerald-400">{entry.handsOnCode}</pre>
                            </div>
                        )}
                        
                        <div className="flex gap-4 text-xs font-mono pt-4 border-t border-slate-200 dark:border-white/10">
                             <span className="text-blue-500">Energy: {entry.energy}/10</span>
                             <span className="text-navy-500 dark:text-indigo-400">Confidence: {entry.confidence}/10</span>
                             <span className="text-slate-500">Mood: {entry.mood}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Notebook;
