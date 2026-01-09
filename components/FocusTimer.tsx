
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';

const FOCUS_TIME = 25 * 60; // 25 minutes standard
const BREAK_TIME = 5 * 60;  // 5 minutes

interface FocusTimerProps {
    autoStart?: boolean;
    onPhaseComplete?: (completedMode: 'focus' | 'break') => void;
    onTick?: (totalSecondsElapsed: number) => void;
}

export interface FocusTimerHandle {
    start: () => void;
    pause: () => void;
    reset: () => void;
    setMode: (mode: 'focus' | 'break') => void;
}

const FocusTimer = forwardRef<FocusTimerHandle, FocusTimerProps>(({ autoStart = false, onPhaseComplete, onTick }, ref) => {
    const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        start: () => setIsActive(true),
        pause: () => setIsActive(false),
        reset: () => {
            setIsActive(false);
            setTimeLeft(FOCUS_TIME);
            setMode('focus');
            setTotalSecondsElapsed(0);
        },
        setMode: (newMode: 'focus' | 'break') => {
            setMode(newMode);
            setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
            // Automatically start the new mode if we are switching
            setIsActive(true);
        }
    }));

    useEffect(() => {
        if (autoStart) {
            setIsActive(true);
        }
    }, [autoStart]);

    useEffect(() => {
        let interval: number | undefined;

        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                
                // Only track "study" time for the total duration log, not break time
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
        setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    };

    const switchMode = () => {
        const newMode = mode === 'focus' ? 'break' : 'focus';
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg relative overflow-hidden group">
            {/* Progress Background */}
            <div 
                className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${mode === 'focus' ? 'bg-blue-500' : 'bg-green-500'}`}
                style={{ width: `${(( (mode === 'focus' ? FOCUS_TIME : BREAK_TIME) - timeLeft) / (mode === 'focus' ? FOCUS_TIME : BREAK_TIME)) * 100}%` }}
            ></div>

            <div className="flex flex-col items-center z-10">
                 <div className={`text-2xl font-mono font-bold leading-none tabular-nums ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                 </div>
                 <button className="flex gap-1 items-center mt-1 cursor-pointer hover:text-white transition-colors text-xs text-gray-500 uppercase font-bold tracking-wider" onClick={switchMode}>
                    {mode === 'focus' ? <Zap className="w-3 h-3 text-blue-400" /> : <Coffee className="w-3 h-3 text-green-400" />}
                    {mode === 'focus' ? 'Focus' : 'Break'}
                 </button>
            </div>

            <div className="h-8 w-px bg-white/10 z-10"></div>

            <div className="flex gap-2 z-10">
                <button 
                    onClick={toggleTimer}
                    className={`p-2 rounded-full transition-all ${isActive ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'} hover:bg-white/10`}
                >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button 
                    onClick={resetTimer}
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

export default FocusTimer;
