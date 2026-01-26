
import React from 'react';
import { X, Trophy, Target, Award } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  xpEarned: number;
  score?: number; 
  title?: string;
  message?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  xpEarned, 
  score,
  title = "Objective Complete",
  message = "Progress has been successfully recorded."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-cardDark border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-6">
                <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-full">
                    <Trophy className="w-10 h-10 text-brand-600 dark:text-brand-400" />
                </div>
            </div>

            <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>

            <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 mb-6 border border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center px-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">+{xpEarned}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">XP Earned</div>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-1 justify-center">
                            <Award className="w-4 h-4" />
                            Logged
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Status</div>
                    </div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full bg-navy-900 hover:bg-navy-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
                Continue
            </button>
        </div>
    </div>
  );
};

export default SuccessModal;
