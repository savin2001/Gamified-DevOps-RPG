
import React from 'react';
import { UserStats } from '../types';
import { LEVEL_THRESHOLDS, LEVEL_TITLES, ACHIEVEMENTS } from '../constants';
import { Trophy, Flame, Activity, Lock, Wallet, Star, Award, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stats: UserStats;
  xpHistory: { date: string; xp: number }[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, xpHistory }) => {
  const nextLevelXp = LEVEL_THRESHOLDS[stats.level] || 10000;
  const prevLevelXp = LEVEL_THRESHOLDS[stats.level - 1] || 0;
  const levelProgress = ((stats.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

  return (
    <div className="space-y-8">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Profile Status Card - Replaces Credit Card */}
        <div className="col-span-1 sm:col-span-2 bg-white dark:bg-surface-cardDark p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Status</h3>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white tracking-tight mb-1">
                            {LEVEL_TITLES[stats.level - 1]}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                LVL {stats.level}
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Award className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                    </div>
                </div>

                <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-xs font-bold tracking-wide">
                        <span className="text-navy-900 dark:text-white">{stats.xp.toLocaleString()} XP</span>
                        <span className="text-slate-400 dark:text-slate-500">{nextLevelXp.toLocaleString()} XP</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-black/40 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-white/5">
                        <div 
                            className="bg-brand-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                            style={{ width: `${Math.min(levelProgress, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-right text-slate-400 dark:text-slate-500 font-medium pt-1">
                        {Math.max(0, nextLevelXp - stats.xp).toLocaleString()} XP to next level
                    </p>
                </div>
            </div>
            
            {/* Background Decor */}
            <div className="absolute -right-6 -bottom-6 opacity-5 dark:opacity-[0.03] text-navy-900 dark:text-white pointer-events-none">
                <Shield className="w-48 h-48" />
            </div>
        </div>

        {/* Streak Card - Gold/Amber */}
        <div className="bg-gold-50 dark:bg-gold-900/10 p-6 rounded-2xl border border-gold-200 dark:border-gold-500/20 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <span className="text-gold-700 dark:text-gold-400 text-xs uppercase font-bold tracking-wider">Compounding Streak</span>
              <Flame className={`w-5 h-5 ${stats.streak > 0 ? 'text-gold-500' : 'text-slate-300 dark:text-slate-600'}`} />
           </div>

           <div className="mt-4">
              <h3 className="text-3xl font-bold text-navy-900 dark:text-white">{stats.streak} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Days</span></h3>
              <div className="flex gap-1 mt-3 h-1.5">
                {[...Array(7)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 rounded-full ${i < (stats.streak % 7) || (stats.streak > 0 && i === 0 && stats.streak % 7 === 0) ? 'bg-gold-500' : 'bg-slate-200 dark:bg-white/10'}`}
                    ></div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Interest accruing daily</p>
           </div>
        </div>

        {/* Sessions Card - Clean White/Dark */}
        <div className="bg-white dark:bg-surface-cardDark p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between w-full items-start mb-2">
                 <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Total Deposits</p>
                 <div className="p-2 bg-navy-50 dark:bg-navy-900/30 rounded-lg">
                    <Wallet className="w-5 h-5 text-navy-600 dark:text-navy-400" />
                 </div>
            </div>
            <h3 className="text-3xl font-bold text-navy-900 dark:text-white">{stats.sessionsCompleted}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Study Sessions Logged</p>
        </div>
      </div>

      {/* Asset Portfolio - Redesigned (No Card Container) */}
      <div className="py-2">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-gold-100 to-gold-50 dark:from-gold-500/20 dark:to-gold-900/10 rounded-xl border border-gold-200 dark:border-gold-500/20 shadow-sm">
                      <Trophy className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-navy-900 dark:text-white tracking-tight">Asset Portfolio</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Earned Badges & Credentials</p>
                  </div>
              </div>
              <div className="hidden sm:block">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <Star className="w-3 h-3 text-gold-500 fill-current" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{ACHIEVEMENTS.filter(a => a.condition(stats)).length} / {ACHIEVEMENTS.length} Acquired</span>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = achievement.condition(stats);
                  const Icon = achievement.icon;

                  return (
                      <div 
                        key={achievement.id} 
                        className={`group relative flex flex-col items-center justify-between p-4 rounded-2xl transition-all duration-300 h-full ${
                            isUnlocked 
                                ? 'bg-white dark:bg-surface-cardDark border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1' 
                                : 'bg-slate-50 dark:bg-white/5 border border-transparent grayscale opacity-50'
                        }`}
                        title={isUnlocked ? `Unlocked: ${achievement.description}` : `Locked: ${achievement.description}`}
                      >
                          <div className="flex-1 flex flex-col items-center justify-center w-full">
                              <div className={`mb-3 p-3 rounded-full transition-colors ${
                                  isUnlocked 
                                    ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 ring-1 ring-gold-100 dark:ring-gold-500/20' 
                                    : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                              }`}>
                                  <Icon className="w-6 h-6" />
                              </div>
                              
                              <h4 className={`text-xs font-bold mb-1 text-center line-clamp-1 ${
                                  isUnlocked ? 'text-navy-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                              }`}>
                                  {achievement.title}
                              </h4>
                          </div>
                          
                          <div className={`w-full pt-3 mt-2 border-t border-slate-100 dark:border-white/5 text-center ${isUnlocked ? '' : 'hidden'}`}>
                              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  +{achievement.xpReward} XP
                              </span>
                          </div>
                          
                          {!isUnlocked && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100/50 dark:bg-black/50 rounded-2xl backdrop-blur-[1px]">
                                  <Lock className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      </div>

      {/* Chart Area - Professional Graph */}
      <div className="bg-white dark:bg-surface-cardDark p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-50 dark:bg-brand-900/10 rounded-lg">
                <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Growth Analytics</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={xpHistory}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#fff',
                    borderColor: '#e2e8f0', 
                    color: '#0f172a',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                }}
                itemStyle={{ color: '#16a34a' }}
              />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="#16a34a" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorXp)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
