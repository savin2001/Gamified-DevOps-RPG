
import React from 'react';
import { UserStats } from '../types';
import { LEVEL_THRESHOLDS, LEVEL_TITLES, ACHIEVEMENTS } from '../constants';
import { Trophy, BookOpen, Flame, Activity, Lock, Wallet, CreditCard } from 'lucide-react';
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
        
        {/* Main Level Card - Styled like a Premium Credit/Debit Card */}
        <div className="col-span-1 sm:col-span-2 bg-gradient-to-br from-[#0B1120] to-[#1e293b] p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden group text-white">
          {/* Card Shine Effect */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-devops-accent/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-400 tracking-widest uppercase">Platinum Engineer</h3>
                    <p className="text-white text-2xl font-mono font-bold mt-1 tracking-wider">**** **** **** {String(stats.xp).padStart(4, '0')}</p>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-white/50 border border-white/20 px-2 py-1 rounded">DEBIT</span>
                    <CreditCard className="w-8 h-8 text-devops-accent" />
                </div>
            </div>
            
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div>
                         <p className="text-[10px] text-gray-500 uppercase font-bold">Account Holder</p>
                         <p className="text-sm text-white font-bold tracking-wide">{LEVEL_TITLES[stats.level - 1]}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-[10px] text-gray-500 uppercase font-bold">Level {stats.level}</p>
                         <p className="text-sm text-devops-accent font-bold">Valid Thru: {Math.round(levelProgress)}%</p>
                    </div>
                </div>
                
                <div className="w-full bg-black/40 rounded-full h-2 border border-white/5 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        style={{ width: `${Math.min(levelProgress, 100)}%` }}
                    ></div>
                </div>
            </div>
          </div>
        </div>

        {/* Streak Card - Styled like a Savings Goal */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-yellow-900/10 backdrop-blur-xl p-6 rounded-3xl border border-yellow-200 dark:border-yellow-500/20 shadow-lg relative overflow-hidden group transition-colors">
           <div className="absolute top-0 right-0 p-2 bg-yellow-500/20 rounded-bl-2xl">
              <Flame className={`w-5 h-5 ${stats.streak > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 dark:text-gray-500'}`} />
           </div>

           <div className="relative z-10 flex flex-col h-full justify-between gap-4 sm:gap-0 mt-2">
              <div>
                  <span className="text-yellow-700/60 dark:text-yellow-200/60 text-xs uppercase font-bold tracking-wider">Compounding Streak</span>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.streak} <span className="text-sm font-normal text-slate-500 dark:text-gray-400">Days</span></h3>
              </div>
              <div>
                  <div className="flex gap-1 mt-2 h-1.5">
                    {[...Array(7)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 rounded-full ${i < (stats.streak % 7) || (stats.streak > 0 && i === 0 && stats.streak % 7 === 0) ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]' : 'bg-slate-200 dark:bg-gray-800'}`}
                        ></div>
                    ))}
                  </div>
                  <p className="text-[10px] text-yellow-600 dark:text-yellow-500/70 mt-2 text-right">Interest accruing daily</p>
              </div>
           </div>
        </div>

        {/* Sessions Card - Styled like Transaction Count */}
        <div className="bg-white dark:bg-devops-card backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col justify-center items-start group hover:border-blue-400 dark:hover:border-devops-accent/30 transition-colors shadow-lg">
            <div className="flex justify-between w-full items-start mb-2">
                 <p className="text-slate-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Total Deposits</p>
                 <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                 </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.sessionsCompleted}</h3>
            <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">Study Sessions Logged</p>
        </div>
      </div>

      {/* Achievement Trophy Case */}
      <div className="bg-white dark:bg-devops-card backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl relative transition-colors">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Asset Portfolio</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-500">Badges & Certifications collected</p>
              </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = achievement.condition(stats);
                  const Icon = achievement.icon;

                  return (
                      <div 
                        key={achievement.id} 
                        className={`group relative p-3 md:p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${
                            isUnlocked 
                                ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-yellow-400/50 dark:border-yellow-500/30 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                                : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 grayscale opacity-50'
                        }`}
                        title={isUnlocked ? `Unlocked: ${achievement.description}` : `Locked: ${achievement.description}`}
                      >
                          {isUnlocked ? (
                              <div className="mb-2 md:mb-3 p-2 md:p-3 bg-yellow-100 dark:bg-yellow-500/10 rounded-full ring-1 ring-yellow-400 dark:ring-yellow-500/50 group-hover:scale-110 transition-transform duration-300">
                                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                              </div>
                          ) : (
                              <div className="mb-2 md:mb-3 p-2 md:p-3 bg-slate-200 dark:bg-gray-800 rounded-full">
                                  <Lock className="w-5 h-5 md:w-6 md:h-6 text-slate-500 dark:text-gray-600" />
                              </div>
                          )}
                          
                          <h4 className={`text-[10px] md:text-xs font-bold mb-1 ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-500'}`}>
                              {achievement.title}
                          </h4>
                          <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-gray-500 font-mono">+{achievement.xpReward} XP</span>
                      </div>
                  );
              })}
          </div>
      </div>

      {/* Chart Area */}
      <div className="bg-white dark:bg-devops-card backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl relative transition-colors">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Growth Analytics</h3>
        </div>
        
        <div className="h-48 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={xpHistory}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    color: '#f3f4f6',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#10b981' }}
                cursor={{ stroke: 'rgba(148, 163, 184, 0.4)', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorXp)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
