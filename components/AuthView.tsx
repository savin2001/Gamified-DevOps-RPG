
import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { UserProfile } from '../types';
import { Rocket, UserPlus, LogIn, ShieldCheck, ArrowLeft, Loader2, Lock, User, Bug, Terminal, Coffee, AlertCircle } from 'lucide-react';

interface AuthViewProps {
    onLogin: (user: UserProfile) => void;
    onBack: () => void;
    isDark?: boolean;
}

const TEST_USERS = [
    { label: 'SysAdmin', username: 'root_access', email: 'admin@devops.com', password: 'securepassword123', icon: ShieldCheck, color: 'text-red-500 dark:text-red-400', border: 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10' },
    { label: 'Cloud Arch', username: 'aws_guru', email: 'architect@cloud.com', password: 's3bucketpolicy', icon: User, color: 'text-blue-500 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Jr. Dev', username: 'git_push_f', email: 'intern@startup.com', password: 'password123', icon: Coffee, color: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-500/10' },
    { label: 'QA Tester', username: 'bug_hunter', email: 'test@quality.com', password: 'itworksformme', icon: Bug, color: 'text-green-500 dark:text-green-400', border: 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10' },
];

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onBack, isDark = true }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Custom Validation State
    const [fieldErrors, setFieldErrors] = useState<{username?: string, email?: string, password?: string}>({});

    const loadTestUser = (user: typeof TEST_USERS[0]) => {
        setUsername(user.username);
        setEmail(user.email);
        setPassword(user.password);
        setFieldErrors({}); // Clear errors on fill
        setError('');
    };

    const validateForm = () => {
        const errors: {username?: string, email?: string, password?: string} = {};
        let isValid = true;

        if (!isLogin && !username.trim()) {
            errors.username = "Username is required";
            isValid = false;
        }

        if (!email.trim()) {
            errors.email = "Email identifier is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Invalid email format";
            isValid = false;
        }

        if (!password.trim()) {
            errors.password = "Password is required";
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                const user = await loginUser(email, password);
                onLogin(user);
            } else {
                const user = await registerUser(username, email, password);
                onLogin(user);
            }
        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes('Failed to fetch')) {
                setError('Cannot connect to server. Ensure backend is running on port 5000.');
            } else {
                setError(err.message || 'Authentication failed. Please check credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const ErrorTooltip = ({ message }: { message?: string }) => {
        if (!message) return null;
        return (
            <div className="absolute right-0 top-0 -mt-2 -translate-y-full z-20 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 relative">
                    <AlertCircle className="w-3 h-3" />
                    {message}
                    {/* Arrow */}
                    <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-red-500"></div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-surface-dark dark' : 'bg-surface-light'}`}>
             {/* Background Effects */}
            <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-navy-900/10' : 'bg-blue-200/40'}`}></div>
            <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-brand-900/10' : 'bg-emerald-200/40'}`}></div>
            
            <button 
                onClick={onBack}
                className={`absolute top-6 left-6 p-3 rounded-full transition-all z-20 group border ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/5' : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200 shadow-sm'}`}
                title="Back to Home"
            >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className={`max-w-md w-full border rounded-3xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500 ${isDark ? 'bg-surface-cardDark border-white/10 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 mb-4 shadow-lg shadow-emerald-900/20">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className={`text-3xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Member Portal</h1>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Secure Authentication Gateway</p>
                </div>

                {/* Test Users Quick Load */}
                <div className={`mb-6 p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 text-center ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Quick Access Personas</p>
                    <div className="grid grid-cols-4 gap-2">
                        {TEST_USERS.map((u, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => loadTestUser(u)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 bg-opacity-10 ${u.border}`}
                                title={`Load ${u.label}`}
                            >
                                <u.icon className={`w-4 h-4 mb-1 ${u.color}`} />
                                <span className={`text-[9px] font-bold ${u.color}`}>{u.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {!isLogin && (
                        <div className="space-y-1 relative group">
                             <div className="flex justify-between">
                                <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Username</label>
                             </div>
                             <div className="relative">
                                 <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); if(fieldErrors.username) setFieldErrors({...fieldErrors, username: undefined}); }}
                                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                                        isDark 
                                            ? 'bg-black/20 text-white border-white/10 placeholder-gray-600' 
                                            : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'
                                    } ${fieldErrors.username ? 'border-red-500/50 focus:border-red-500' : 'focus:border-emerald-500'}`}
                                    placeholder="Callsign (e.g. CloudWalker)"
                                />
                                <ErrorTooltip message={fieldErrors.username} />
                             </div>
                        </div>
                    )}
                    
                    <div className="space-y-1 relative group">
                        <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Email Identifier</label>
                        <div className="relative">
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if(fieldErrors.email) setFieldErrors({...fieldErrors, email: undefined}); }}
                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                                    isDark 
                                        ? 'bg-black/20 text-white border-white/10 placeholder-gray-600' 
                                        : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'
                                } ${fieldErrors.email ? 'border-red-500/50 focus:border-red-500' : 'focus:border-emerald-500'}`}
                                placeholder="user@example.com"
                            />
                            <ErrorTooltip message={fieldErrors.email} />
                        </div>
                    </div>

                    <div className="space-y-1 relative group">
                        <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Password</label>
                        <div className="relative">
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if(fieldErrors.password) setFieldErrors({...fieldErrors, password: undefined}); }}
                                className={`w-full border rounded-xl px-4 py-3 pl-10 focus:outline-none transition-colors ${
                                    isDark 
                                        ? 'bg-black/20 text-white border-white/10 placeholder-gray-600' 
                                        : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'
                                } ${fieldErrors.password ? 'border-red-500/50 focus:border-red-500' : 'focus:border-emerald-500'}`}
                                placeholder="••••••••"
                            />
                            <Lock className={`w-4 h-4 absolute left-3 top-3.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                            <ErrorTooltip message={fieldErrors.password} />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                             <span>{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-wait text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? <LogIn className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />)}
                        {isLoading ? 'Authenticating...' : (isLogin ? 'Secure Login' : 'Create Profile')}
                    </button>
                </form>

                <div className={`mt-6 text-center border-t pt-6 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); setFieldErrors({}); }}
                        className={`text-sm transition-colors flex items-center justify-center gap-2 mx-auto group ${isDark ? 'text-gray-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        {isLogin ? (
                            <>First time user? <span className="text-emerald-500 font-bold group-hover:underline">Register Account</span></>
                        ) : (
                            <>Existing member? <span className="text-emerald-500 font-bold group-hover:underline">Login</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
