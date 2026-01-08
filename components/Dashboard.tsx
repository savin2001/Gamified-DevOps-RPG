
import React from 'react';
import { UserStats } from '../types';
import { LEVEL_THRESHOLDS, LEVEL_TITLES } from '../constants';
import { Zap, Trophy, Clock, BookOpen, Flame } from 'lucide-react';
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
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-devops-card p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Current Level</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.level}</h3>
              <p className="text-devops-accent text-sm mt-1">{LEVEL_TITLES[stats.level - 1]}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{stats.xp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(levelProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-devops-card p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Study Streak</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.streak} Days</h3>
              <p className="text-gray-400 text-xs mt-1">Keep it burning!</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Flame className={`w-6 h-6 ${stats.streak > 0 ? 'text-orange-500' : 'text-gray-500'}`} />
            </div>
          </div>
          <div className="mt-4 flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className={`h-2 flex-1 rounded-full ${i < (stats.streak % 7) || (stats.streak > 0 && i === 0 && stats.streak % 7 === 0) ? 'bg-orange-500' : 'bg-gray-700'}`}
              ></div>
            ))}
          </div>
        </div>

        <div className="bg-devops-card p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Hours</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalStudyHours}h</h3>
              <p className="text-devops-success text-xs mt-1">Invested in future</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-devops-card p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Sessions</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.sessionsCompleted}</h3>
              <p className="text-purple-400 text-xs mt-1">Learning blocks</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-devops-card p-6 rounded-xl border border-gray-700 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6">XP Progression</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={xpHistory}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#4b5563', color: '#f3f4f6' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Area type="monotone" dataKey="xp" stroke="#3b82f6" fillOpacity={1} fill="url(#colorXp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
