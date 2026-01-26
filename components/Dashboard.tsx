
import React from 'react';
import { UserStats } from '../types';
import { LEVEL_THRESHOLDS, LEVEL_TITLES, ACHIEVEMENTS } from '../constants';
import { Trophy, Flame, Activity, Lock, Wallet, CreditCard } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Main Level Card - Clean Corporate Look */}
        <div className="col-span-1 sm:col-span-2 bg-navy-900 dark:bg-navy-950 p-6 rounded-2xl border border-navy-800 shadow-md text-white relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <CreditCard className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-bold text-navy-200 tracking-widest uppercase">Platinum Engineer</h3>
                    <p className="text-2xl font-mono font-bold mt-1 tracking-wider text-white">**** **** **** {String(stats.xp).padStart(4, '0')}</p>
                </div>
                <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold border border-white/20">DEBIT</div>
            </div>
            
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div>
                         <p className="text-[10px] text-navy-300 uppercase font-bold">Account Holder</p>
                         <p className="text-sm text-white font-bold tracking-wide">{LEVEL_TITLES[stats.level - 1]}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-[10px] text-navy-300 uppercase font-bold">Level {stats.level}</p>
                         <p className="text-sm text-brand-400 font-bold">Valid Thru: {Math.round(levelProgress)}%</p>
                    </div>
                </div>
                
                <div className="w-full bg-navy-800/50 rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(levelProgress, 100)}%` }}
                    ></div>
                </div>
            </div>
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

      {/* Achievement Trophy Case - Structured Grid */}
      <div className="bg-white dark:bg-surface-cardDark p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gold-50 dark:bg-gold-900/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">Asset Portfolio</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Badges & Certifications</p>
              </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = achievement.condition(stats);
                  const Icon = achievement.icon;

                  return (
                      <div 
                        key={achievement.id} 
                        className={`group p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                            isUnlocked 
                                ? 'bg-surface-light dark:bg-white/5 border-gold-200 dark:border-gold-500/30' 
                                : 'bg-slate-50 dark:bg-black/20 border-transparent grayscale opacity-60'
                        }`}
                        title={isUnlocked ? `Unlocked: ${achievement.description}` : `Locked: ${achievement.description}`}
                      >
                          <div className={`mb-2 p-2 rounded-full ${isUnlocked ? 'bg-white dark:bg-white/10 text-gold-500' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                              <Icon className="w-5 h-5" />
                          </div>
                          
                          <h4 className={`text-[10px] font-bold mb-1 ${isUnlocked ? 'text-navy-900 dark:text-white' : 'text-slate-500'}`}>
                              {achievement.title}
                          </h4>
                          <span className="text-[9px] font-mono text-slate-400">+{achievement.xpReward} XP</span>
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
