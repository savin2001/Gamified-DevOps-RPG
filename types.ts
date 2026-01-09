
export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: string | null;
  totalStudyHours: number;
  sessionsCompleted: number;
  projectsCompleted: number;
  certificationsEarned: number;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  xpEarned: number;
  timestamp: string;
  weekId?: number; // Added to track progress per week
}

export enum ActivityType {
  STUDY_SESSION = 'STUDY_SESSION',
  LAB_SESSION = 'LAB_SESSION',
  PROJECT_WORK = 'PROJECT_WORK',
  BLOG_POST = 'BLOG_POST',
  COMMUNITY_HELP = 'COMMUNITY_HELP',
  GITHUB_COMMIT = 'GITHUB_COMMIT',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  xpReward: number;
  condition: (stats: UserStats) => boolean;
}

export interface CurriculumWeek {
  id: number;
  phase: number;
  title: string;
  description: string;
  topics: string[];
  isCompleted: boolean;
  projects?: string[];
}

export interface LabDefinition {
  id: string;
  type: 'Lab' | 'Project'; 
  weekId: number;
  title: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  objectives: string[];
  prerequisites: string[];
  steps: { title: string; instruction: string; command?: string }[];
  verificationCommand?: string;
  expectedOutput?: string;
}

export interface NoteEntry {
  id: string;
  week: number;
  day: number;
  date: string;
  time: string;
  duration: string;
  
  // Header Info
  mainTopic: string;
  status: 'Completed' | 'In Progress';

  // Learning Content
  topics: { title: string; notes: string }[]; // Structured topics
  
  // Hands On
  activities: string[]; // Checklist of what was done
  handsOnCode: string;
  
  // Analysis
  takeaways: string[]; // Top 3 insights
  challenge: { problem: string; solution: string; learning: string };
  
  // Resources & Planning
  resources: { title: string; type: string }[];
  plan: { goal: string; prep: string }[]; // Tomorrow's plan breakdown

  // Metrics & Reflection
  mood: string;
  energy: number;
  confidence: number;
  focus: 'High' | 'Medium' | 'Low';
  quality: 'Strong' | 'Average' | 'Needs Review';
  
  // Personal
  reflection: string;
  questions: string;

  // Legacy fields (optional for backward compatibility)
  concepts?: string[];
  tools?: string[];
  handsOnDescription?: string;
}

export interface BlogPost {
  id: string;
  week: number;
  title: string;
  content: string;
  githubUrl: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
