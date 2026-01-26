
import React, { useState, useEffect } from 'react';
import { generateQuiz, QuizQuestion } from '../services/geminiService';
import { logActivity, saveQuizResult } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Brain, CheckCircle, XCircle, RefreshCw, AlertTriangle, X, ShieldAlert, Trophy, ArrowRight } from 'lucide-react';
import SuccessModal from './SuccessModal';

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    topic: string;
    weekId: number;
    onComplete: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, topic, weekId, onComplete }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showXPModal, setShowXPModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadQuiz();
        }
    }, [isOpen, topic]);

    const loadQuiz = async () => {
        setLoading(true);
        setError(null);
        setQuestions([]);
        setScore(0);
        setCurrentQuestionIdx(0);
        setShowResults(false);
        
        try {
            const data = await generateQuiz(topic, weekId);
            if (!data || data.length === 0) throw new Error("No data.");
            setQuestions(data);
        } catch (err: any) {
            setError("Assessment generation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (index: number) => {
        if (selectedOption !== null) return; 
        setSelectedOption(index);
        const correct = index === questions[currentQuestionIdx].correctIndex;
        setIsCorrect(correct);
        if (correct) setScore(prev => prev + 1);
    };

    const nextQuestion = () => {
        setSelectedOption(null);
        setIsCorrect(null);
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setShowResults(true);
        const passed = (score / questions.length) >= 0.8;
        if (passed) {
            saveQuizResult(weekId, (score / questions.length) * 100);
            logActivity(ActivityType.QUIZ_COMPLETION, `Passed Quiz: ${topic}`, weekId);
            onComplete();
            setTimeout(() => setShowXPModal(true), 1000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-surface-cardDark border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center border border-navy-100 dark:border-navy-800">
                            <Brain className="w-5 h-5 text-navy-600 dark:text-navy-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-navy-900 dark:text-white">Knowledge Checkpoint</h2>
                            <p className="text-xs text-slate-500">WEEK {weekId} &bull; {topic}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 min-h-[400px]">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 text-sm">Synthesizing Assessment...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Generation Failed</h3>
                            <button onClick={loadQuiz} className="mt-4 px-6 py-2 bg-navy-900 text-white rounded-lg">Retry</button>
                        </div>
                    ) : showResults ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 mb-6 ${score / questions.length >= 0.8 ? 'border-brand-500 text-brand-500' : 'border-red-500 text-red-500'}`}>
                                {score / questions.length >= 0.8 ? <Trophy className="w-10 h-10" /> : <RefreshCw className="w-10 h-10" />}
                            </div>
                            <h2 className="text-4xl font-bold text-navy-900 dark:text-white mb-2">{Math.round((score / questions.length) * 100)}%</h2>
                            <p className="text-slate-500 mb-8">{score / questions.length >= 0.8 ? "Proficiency Verified." : "Requirements Not Met."}</p>
                            <button onClick={score / questions.length >= 0.8 ? onClose : loadQuiz} className="px-8 py-3 bg-navy-900 dark:bg-white dark:text-black text-white font-bold rounded-lg">
                                {score / questions.length >= 0.8 ? "Return to Dashboard" : "Retake Assessment"}
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {currentQuestionIdx + 1} of {questions.length}</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-8">{questions[currentQuestionIdx].question}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {questions[currentQuestionIdx].options.map((opt, i) => {
                                    let style = "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-navy-400";
                                    if (selectedOption !== null) {
                                        if (i === questions[currentQuestionIdx].correctIndex) style = "bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-700 dark:text-brand-400";
                                        else if (i === selectedOption) style = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                                        else style = "opacity-50 grayscale";
                                    }
                                    
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => handleAnswer(i)}
                                            disabled={selectedOption !== null}
                                            className={`p-4 rounded-xl border text-left transition-all ${style}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{opt}</span>
                                                {selectedOption !== null && i === questions[currentQuestionIdx].correctIndex && <CheckCircle className="w-4 h-4 text-brand-500" />}
                                                {selectedOption === i && i !== questions[currentQuestionIdx].correctIndex && <XCircle className="w-4 h-4 text-red-500" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedOption !== null && (
                                <div className="mt-8 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex justify-between items-center animate-in slide-in-from-bottom-2">
                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                        <span className="font-bold block mb-1">Analysis:</span>
                                        {questions[currentQuestionIdx].explanation}
                                    </div>
                                    <button onClick={nextQuestion} className="px-6 py-2 bg-navy-900 dark:bg-white text-white dark:text-black font-bold rounded-lg ml-4 whitespace-nowrap">
                                        Next <ArrowRight className="w-4 h-4 inline ml-1" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <SuccessModal 
                isOpen={showXPModal}
                onClose={() => { setShowXPModal(false); onClose(); }}
                xpEarned={150}
                title="Checkpoint Cleared"
            />
        </div>
    );
};

export default QuizModal;
