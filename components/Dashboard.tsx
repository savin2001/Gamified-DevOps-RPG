
import React from 'react';
import { UserStats } from '../types';
import { LEVEL_THRESHOLDS, LEVEL_TITLES, ACHIEVEMENTS } from '../constants';
import { Trophy, BookOpen, Flame, Activity, Lock } from 'lucide-react';
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Main Level Card */}
        <div className="col-span-2 bg-gradient-to-br from-blue-900/40 to-indigo-900/20 backdrop-blur-xl p-6 rounded-3xl border border-blue-500/20 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-24 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{stats.level}</h3>
                    <p className="text-blue-300 text-sm font-medium uppercase tracking-wider">{LEVEL_TITLES[stats.level - 1]}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                  <Trophy className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-blue-200/60 font-mono">
                    <span>{stats.xp} XP</span>
                    <span>{nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-3 border border-blue-500/20 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-blue-600 via-cyan-400 to-white h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        style={{ width: `${Math.min(levelProgress, 100)}%` }}
                    ></div>
                </div>
                <p className="text-[10px] text-right text-blue-400/80 animate-pulse">Next Rank: {LEVEL_TITLES[stats.level] || 'Max Level'}</p>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-900/40 to-red-900/20 backdrop-blur-xl p-6 rounded-3xl border border-orange-500/20 shadow-lg relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
           <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl"></div>

           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                  <span className="text-orange-200/60 text-xs uppercase font-bold tracking-wider">Streak</span>
                  <Flame className={`w-5 h-5 ${stats.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-500'}`} />
              </div>
              <div>
                  <h3 className="text-3xl font-bold text-white">{stats.streak} <span className="text-sm font-normal text-gray-400">Days</span></h3>
                  <div className="flex gap-1 mt-2 h-1.5">
                    {[...Array(7)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 rounded-full ${i < (stats.streak % 7) || (stats.streak > 0 && i === 0 && stats.streak % 7 === 0) ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]' : 'bg-gray-800'}`}
                        ></div>
                    ))}
                  </div>
              </div>
           </div>
        </div>

        {/* Simple Session Stat Card */}
        <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex flex-col justify-center items-start group hover:bg-white/5 transition-colors">
            <div className="flex justify-between w-full items-start mb-2">
                 <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Sessions</p>
                 <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                 </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{stats.sessionsCompleted}</h3>
            <p className="text-[10px] text-gray-500 mt-1">Total Logs</p>
        </div>
      </div>

      {/* Achievement Trophy Case */}
      <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-white">Trophy Case</h3>
                  <p className="text-xs text-gray-500">Collect badges by completing milestones</p>
              </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = achievement.condition(stats);
                  const Icon = achievement.icon;

                  return (
                      <div 
                        key={achievement.id} 
                        className={`group relative p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${
                            isUnlocked 
                                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/30 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                                : 'bg-black/20 border-white/5 grayscale opacity-50'
                        }`}
                        title={isUnlocked ? `Unlocked: ${achievement.description}` : `Locked: ${achievement.description}`}
                      >
                          {isUnlocked ? (
                              <div className="mb-3 p-3 bg-yellow-500/10 rounded-full ring-1 ring-yellow-500/50 group-hover:scale-110 transition-transform duration-300">
                                  <Icon className="w-6 h-6 text-yellow-400" />
                              </div>
                          ) : (
                              <div className="mb-3 p-3 bg-gray-800 rounded-full">
                                  <Lock className="w-6 h-6 text-gray-600" />
                              </div>
                          )}
                          
                          <h4 className={`text-xs font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                              {achievement.title}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-mono">+{achievement.xpReward} XP</span>
                      </div>
                  );
              })}
          </div>
      </div>

      {/* Chart Area */}
      <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">XP Trajectory</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={xpHistory}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    color: '#f3f4f6',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#60a5fa' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="#3b82f6" 
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
