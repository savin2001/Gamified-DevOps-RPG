
import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { UserProfile } from '../types';
import { Rocket, UserPlus, LogIn, ShieldCheck } from 'lucide-react';

interface AuthViewProps {
    onLogin: (user: UserProfile) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const user = loginUser(email);
            if (user) {
                onLogin(user);
            } else {
                setError('User not found. Please register.');
            }
        } else {
            if (!username) {
                setError('Username is required for registration.');
                return;
            }
            const user = registerUser(username, email);
            if (user) {
                onLogin(user);
            } else {
                setError('Email already registered. Please login.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
             {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-md w-full bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-900/20">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">DevOps Quest</h1>
                    <p className="text-gray-400">Identify yourself, Engineer.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</label>
                             <input 
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Callsign (e.g. CloudWalker)"
                            />
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Identifier</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 mt-2"
                    >
                        {isLogin ? <LogIn className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        {isLogin ? 'Access System' : 'Initialize Profile'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-gray-500 hover:text-white text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLogin ? (
                            <>New recruit? <span className="text-blue-400">Create profile</span></>
                        ) : (
                            <>Already registered? <span className="text-blue-400">Login</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
