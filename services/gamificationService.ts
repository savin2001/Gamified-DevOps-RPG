
import { UserStats, ActivityLog, ActivityType, Achievement, NoteEntry } from '../types';
import { XP_VALUES, LEVEL_THRESHOLDS, INITIAL_STATS } from '../constants';

const STORAGE_KEY_STATS = 'devops_quest_stats';
const STORAGE_KEY_LOGS = 'devops_quest_logs';
const STORAGE_KEY_NOTEBOOK = 'devops_quest_notebook';
const STORAGE_KEY_LABS = 'devops_quest_labs';
const STORAGE_KEY_LAB_SUBMISSIONS = 'devops_quest_lab_submissions';

export const getStoredStats = (): UserStats => {
  const stored = localStorage.getItem(STORAGE_KEY_STATS);
  return stored ? JSON.parse(stored) : INITIAL_STATS;
};

export const getActivityHistory = (): ActivityLog[] => {
  const stored = localStorage.getItem(STORAGE_KEY_LOGS);
  return stored ? JSON.parse(stored) : [];
};

export const getNotebookEntries = (): NoteEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY_NOTEBOOK);
  return stored ? JSON.parse(stored) : [];
};

export const getCompletedLabs = (): string[] => {
    const stored = localStorage.getItem(STORAGE_KEY_LABS);
    return stored ? JSON.parse(stored) : [];
};

export const getLabSubmissions = (): Record<string, string> => {
    const stored = localStorage.getItem(STORAGE_KEY_LAB_SUBMISSIONS);
    return stored ? JSON.parse(stored) : {};
};

export const saveStats = (stats: UserStats) => {
  localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
};

export const saveActivity = (log: ActivityLog) => {
  const history = getActivityHistory();
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify([log, ...history]));
};

export const saveNotebookEntry = (entry: NoteEntry) => {
    const entries = getNotebookEntries();
    localStorage.setItem(STORAGE_KEY_NOTEBOOK, JSON.stringify([entry, ...entries]));
};

export const saveLabCompletion = (labId: string) => {
    const labs = getCompletedLabs();
    if (!labs.includes(labId)) {
        localStorage.setItem(STORAGE_KEY_LABS, JSON.stringify([...labs, labId]));
    }
};

export const saveLabSubmission = (labId: string, output: string) => {
    const submissions = getLabSubmissions();
    submissions[labId] = output;
    localStorage.setItem(STORAGE_KEY_LAB_SUBMISSIONS, JSON.stringify(submissions));
};

export const resetProgress = (): UserStats => {
    localStorage.clear();
    return INITIAL_STATS;
};

export const calculateLevel = (currentXp: number): number => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (currentXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

export const checkStreak = (lastDateStr: string | null): number => {
  if (!lastDateStr) return 0;
  
  const lastDate = new Date(lastDateStr);
  const today = new Date();
  
  // Reset time part for accurate date comparison
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return getStoredStats().streak; // Streak continues today
  if (diffDays === 1) return getStoredStats().streak; // Streak continues from yesterday
  return 0; // Streak broken
};

export const logActivity = (type: ActivityType, description: string, weekId?: number): { newStats: UserStats, xpGained: number } => {
  const stats = getStoredStats();
  const xpGained = XP_VALUES[type];
  
  // Update Streak
  const currentStreak = checkStreak(stats.lastActivityDate);
  const isNewDay = !stats.lastActivityDate || new Date(stats.lastActivityDate).toDateString() !== new Date().toDateString();
  
  const newStreak = isNewDay && currentStreak > 0 ? currentStreak + 1 : (currentStreak === 0 ? 1 : currentStreak);

  const newStats: UserStats = {
    ...stats,
    xp: stats.xp + xpGained,
    level: calculateLevel(stats.xp + xpGained),
    streak: newStreak,
    lastActivityDate: new Date().toISOString(),
    sessionsCompleted: stats.sessionsCompleted + (type === ActivityType.STUDY_SESSION ? 1 : 0),
    totalStudyHours: stats.totalStudyHours + (type === ActivityType.STUDY_SESSION ? 1.5 : (type === ActivityType.LAB_SESSION ? 3.0 : 0))
  };

  const log: ActivityLog = {
    id: Date.now().toString(),
    type,
    description,
    xpEarned: xpGained,
    timestamp: new Date().toISOString(),
    weekId
  };

  saveStats(newStats);
  saveActivity(log);

  return { newStats, xpGained };
};

// --- New Helper Functions for Workflow Enforcements ---

export const getStudySessionsForWeek = (weekId: number): number => {
    const entries = getNotebookEntries();
    return entries.filter(e => e.week === weekId).length;
};

export const hasBlogForWeek = (weekId: number): boolean => {
    const logs = getActivityHistory();
    return logs.some(log => log.type === ActivityType.BLOG_POST && log.weekId === weekId);
};
