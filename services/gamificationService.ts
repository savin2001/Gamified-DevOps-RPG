
import { UserStats, ActivityLog, ActivityType, NoteEntry, BlogPost, UserProfile, Achievement } from '../types';
import { XP_VALUES, LEVEL_THRESHOLDS, INITIAL_STATS } from '../constants';
import { getCurrentUser, getUsers } from './authService';

// We now prefix keys with the UserID
const getKey = (baseKey: string, userId?: string) => {
    const uid = userId || getCurrentUser()?.id;
    if (!uid) throw new Error("No active user session for data access");
    return `${uid}_${baseKey}`;
};

const BASE_KEYS = {
    STATS: 'stats',
    LOGS: 'logs',
    NOTEBOOK: 'notebook',
    LABS: 'labs',
    LAB_SUBMISSIONS: 'lab_submissions',
    BLOGS: 'blogs',
    QUIZZES: 'quizzes'
};

export const getStoredStats = (userId?: string): UserStats => {
  try {
      const key = getKey(BASE_KEYS.STATS, userId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : { ...INITIAL_STATS, userId: userId || 'unknown' };
  } catch (e) {
      return INITIAL_STATS;
  }
};

export const getActivityHistory = (userId?: string): ActivityLog[] => {
  try {
      const key = getKey(BASE_KEYS.LOGS, userId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

export const getNotebookEntries = (userId?: string): NoteEntry[] => {
  try {
      const key = getKey(BASE_KEYS.NOTEBOOK, userId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

export const getCompletedLabs = (userId?: string): string[] => {
    try {
        const key = getKey(BASE_KEYS.LABS, userId);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

export const getLabSubmissions = (userId?: string): Record<string, string> => {
    try {
        const key = getKey(BASE_KEYS.LAB_SUBMISSIONS, userId);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
};

export const getBlogPosts = (userId?: string): BlogPost[] => {
    try {
        const key = getKey(BASE_KEYS.BLOGS, userId);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

export const getBlogPostForWeek = (week: number, userId?: string): BlogPost | undefined => {
    const posts = getBlogPosts(userId);
    return posts.find(p => p.week === week);
};

export const getQuizResults = (userId?: string): Record<number, number> => {
    try {
        const key = getKey(BASE_KEYS.QUIZZES, userId);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
};

// --- WRITE OPERATIONS (Always acting on Current User) ---

export const saveStats = (stats: UserStats) => {
  const key = getKey(BASE_KEYS.STATS);
  localStorage.setItem(key, JSON.stringify(stats));
};

export const saveActivity = (log: ActivityLog) => {
  const history = getActivityHistory();
  const key = getKey(BASE_KEYS.LOGS);
  localStorage.setItem(key, JSON.stringify([log, ...history]));
};

export const saveNotebookEntry = (entry: NoteEntry) => {
    const entries = getNotebookEntries();
    const key = getKey(BASE_KEYS.NOTEBOOK);
    localStorage.setItem(key, JSON.stringify([entry, ...entries]));
};

export const saveLabCompletion = (labId: string) => {
    const labs = getCompletedLabs();
    if (!labs.includes(labId)) {
        const key = getKey(BASE_KEYS.LABS);
        localStorage.setItem(key, JSON.stringify([...labs, labId]));
    }
};

export const saveLabSubmission = (labId: string, output: string) => {
    const submissions = getLabSubmissions();
    submissions[labId] = output;
    const key = getKey(BASE_KEYS.LAB_SUBMISSIONS);
    localStorage.setItem(key, JSON.stringify(submissions));
};

export const saveBlogPost = (post: BlogPost) => {
    const posts = getBlogPosts();
    const otherPosts = posts.filter(p => p.week !== post.week);
    const key = getKey(BASE_KEYS.BLOGS);
    localStorage.setItem(key, JSON.stringify([post, ...otherPosts]));
};

export const saveQuizResult = (weekId: number, score: number) => {
    const results = getQuizResults();
    // Only overwrite if score is higher
    if ((results[weekId] || 0) < score) {
        results[weekId] = score;
        const key = getKey(BASE_KEYS.QUIZZES);
        localStorage.setItem(key, JSON.stringify(results));
    }
};

export const resetProgress = (): UserStats => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Clear only this user's data
        Object.values(BASE_KEYS).forEach(base => {
             localStorage.removeItem(`${currentUser.id}_${base}`);
        });
    }
    return INITIAL_STATS;
};

// --- LOGIC ---

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
    totalStudyHours: stats.totalStudyHours + (type === ActivityType.STUDY_SESSION ? 1.5 : (type === ActivityType.LAB_SESSION ? 3.0 : 0)),
    // Fix: Explicitly track projects, labs, quizzes, blogs
    labsCompleted: (stats.labsCompleted || 0) + (type === ActivityType.LAB_SESSION ? 1 : 0),
    projectsCompleted: (stats.projectsCompleted || 0) + (type === ActivityType.PROJECT_WORK ? 1 : 0),
    quizzesCompleted: (stats.quizzesCompleted || 0) + (type === ActivityType.QUIZ_COMPLETION ? 1 : 0),
    blogsCompleted: (stats.blogsCompleted || 0) + (type === ActivityType.BLOG_POST ? 1 : 0),
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

export const getStudySessionsForWeek = (weekId: number): number => {
    const entries = getNotebookEntries();
    return entries.filter(e => e.week === weekId).length;
};

// --- Leaderboard & Multi-User Logic ---

export interface LeaderboardEntry {
    user: UserProfile;
    stats: UserStats;
}

export const getLeaderboardData = (): LeaderboardEntry[] => {
    const users = getUsers();
    const leaderboard: LeaderboardEntry[] = users.map(user => {
        const stats = getStoredStats(user.id);
        return { user, stats };
    });

    // Sort by XP Descending
    return leaderboard.sort((a, b) => b.stats.xp - a.stats.xp);
};
