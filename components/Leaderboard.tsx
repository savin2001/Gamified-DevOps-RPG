
import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, getLeaderboardData } from '../services/gamificationService';
import { Trophy, Medal, Crown, Shield, User } from 'lucide-react';
import { LEVEL_TITLES } from '../constants';
import { UserProfile } from '../types';

interface LeaderboardProps {
    currentUser: UserProfile;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
    const [data, setData] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        setData(getLeaderboardData());
    }, []);

    const getRankIcon = (index: number) => {
        switch(index) {
            case 0: return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />;
            case 1: return <Medal className="w-6 h-6 text-gray-300" />;
            case 2: return <Medal className="w-6 h-6 text-orange-400" />;
            default: return <span className="text-gray-500 font-mono font-bold w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
                    <span className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-xl border border-white/10">
                        <Trophy className="text-yellow-400 w-6 h-6" />
                    </span>
                    Engineer Leaderboard
                </h2>
                <p className="text-gray-400 mt-2 text-sm">Compare progress with your peers. Rise to the top.</p>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-5 md:col-span-4">User</div>
                    <div className="col-span-3 hidden md:block">Title</div>
                    <div className="col-span-3 md:col-span-2 text-right">XP</div>
                    <div className="col-span-3 md:col-span-2 text-right">Level</div>
                </div>

                <div className="divide-y divide-white/5">
                    {data.map((entry, index) => {
                        const isMe = entry.user.id === currentUser.id;
                        return (
                            <div 
                                key={entry.user.id} 
                                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                                    isMe ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-white/5'
                                }`}
                            >
                                <div className="col-span-1 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                
                                <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                                        isMe ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-400'
                                    }`}>
                                        {entry.user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-white font-bold truncate flex items-center gap-2">
                                            {entry.user.username}
                                            {isMe && <span className="text-[10px] bg-blue-500 text-white px-1.5 rounded">YOU</span>}
                                            {entry.user.role === 'admin' && (
                                                <span title="Admin">
                                                    <Shield className="w-3 h-3 text-red-400" />
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate">{entry.user.email}</div>
                                    </div>
                                </div>

                                <div className="col-span-3 hidden md:flex items-center">
                                     <span className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 truncate">
                                        {LEVEL_TITLES[entry.stats.level - 1] || 'Unknown'}
                                     </span>
                                </div>

                                <div className="col-span-3 md:col-span-2 text-right font-mono font-bold text-yellow-400">
                                    {entry.stats.xp.toLocaleString()}
                                </div>

                                <div className="col-span-3 md:col-span-2 text-right">
                                    <div className="inline-block text-xs font-bold text-white bg-gray-700 px-2 py-1 rounded">
                                        LVL {entry.stats.level}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
