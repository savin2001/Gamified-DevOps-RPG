
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Timer } from 'lucide-react';

const DEFAULT_FOCUS_TIME = 25 * 60; 
const BREAK_TIME = 5 * 60; 

interface FocusTimerProps {
    autoStart?: boolean;
    initialMinutes?: number;
    enablePomodoro?: boolean;
    onPhaseComplete?: (completedMode: 'focus' | 'break') => void;
    onTick?: (totalSecondsElapsed: number) => void;
}

export interface FocusTimerHandle {
    start: () => void;
    pause: () => void;
    reset: () => void;
    setMode: (mode: 'focus' | 'break') => void;
}

const FocusTimer = forwardRef<FocusTimerHandle, FocusTimerProps>(({ 
    autoStart = false, 
    initialMinutes = 25, 
    enablePomodoro = true,
    onPhaseComplete, 
    onTick 
}, ref) => {
    const durationSeconds = initialMinutes * 60;
    const [timeLeft, setTimeLeft] = useState(durationSeconds);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);

    useEffect(() => {
        setTimeLeft(durationSeconds);
        setIsActive(autoStart);
        setMode('focus');
    }, [initialMinutes, autoStart]);

    useImperativeHandle(ref, () => ({
        start: () => setIsActive(true),
        pause: () => setIsActive(false),
        reset: () => {
            setIsActive(false);
            setTimeLeft(durationSeconds);
            setMode('focus');
            setTotalSecondsElapsed(0);
        },
        setMode: (newMode: 'focus' | 'break') => {
            setMode(newMode);
            setTimeLeft(newMode === 'focus' ? durationSeconds : BREAK_TIME);
            setIsActive(true);
        }
    }));

    useEffect(() => {
        let interval: number | undefined;

        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                if (mode === 'focus') {
                    setTotalSecondsElapsed(prev => {
                        const newVal = prev + 1;
                        if (onTick) onTick(newVal);
                        return newVal;
                    });
                }
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (onPhaseComplete) {
                onPhaseComplete(mode);
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, onTick, onPhaseComplete]);

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? durationSeconds : BREAK_TIME);
    };

    const switchMode = () => {
        if (!enablePomodoro) return;
        const newMode = mode === 'focus' ? 'break' : 'focus';
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === 'focus' ? durationSeconds : BREAK_TIME);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const totalDuration = mode === 'focus' ? durationSeconds : BREAK_TIME;
    const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

    return (
        <div className="flex items-center gap-4 bg-white dark:bg-navy-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group min-w-[180px] justify-between transition-colors duration-300">
            {/* Semantic Progress Bar (No Neon) */}
            <div 
                className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${mode === 'focus' ? 'bg-navy-600 dark:bg-brand-500' : 'bg-gold-500'}`}
                style={{ width: `${progress}%` }}
            ></div>

            <div className="flex flex-col items-start z-10 pl-1">
                 <div className={`text-xl font-mono font-bold leading-none tabular-nums ${timeLeft < 60 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {formatTime(timeLeft)}
                 </div>
                 {enablePomodoro ? (
                     <button className="flex gap-1 items-center mt-1 cursor-pointer hover:opacity-80 transition-opacity text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider" onClick={switchMode}>
                        {mode === 'focus' ? <Zap className="w-3 h-3 text-navy-600 dark:text-brand-400" /> : <Coffee className="w-3 h-3 text-gold-600 dark:text-gold-400" />}
                        {mode === 'focus' ? 'Focus Session' : 'Short Break'}
                     </button>
                 ) : (
                     <div className="flex gap-1 items-center mt-1 text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                        <Timer className="w-3 h-3 text-navy-600 dark:text-brand-400" />
                        Session
                     </div>
                 )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 z-10"></div>

            <div className="flex gap-1 z-10">
                <button 
                    onClick={toggleTimer}
                    className={`p-2 rounded-lg transition-all ${
                        isActive 
                        ? 'bg-gold-100 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400' 
                        : 'bg-slate-100 dark:bg-white/10 text-navy-700 dark:text-brand-400'
                    } hover:shadow-sm`}
                >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button 
                    onClick={resetTimer}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

export default FocusTimer;
