
import React, { useState, useEffect } from 'react';
import { generateQuiz, QuizQuestion } from '../services/geminiService';
import { logActivity, saveQuizResult } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Brain, CheckCircle, XCircle, Loader2, Trophy, ArrowRight, RefreshCw, AlertTriangle, X, ShieldAlert } from 'lucide-react';
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
    const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
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
        setIsApiKeyMissing(false);
        setQuestions([]);
        setScore(0);
        setCurrentQuestionIdx(0);
        setShowResults(false);
        
        try {
            const data = await generateQuiz(topic, weekId);
            if (!data || data.length === 0) {
                throw new Error("AI returned empty data.");
            }
            setQuestions(data);
        } catch (err: any) {
            if (err.message === "API_KEY_MISSING") {
                setIsApiKeyMissing(true);
                setError("API Key Config Required");
            } else {
                setError("Failed to generate quiz parameters. The neural link might be unstable.");
            }
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Main Glass Container - Floating Size */}
            {/* Adjusted responsive width/height to be more "floating" on desktop (65vw/75vh) while keeping mobile accessible */}
            <div className="w-[95vw] h-[90vh] md:w-[85vw] md:h-[80vh] lg:w-[65vw] lg:h-[75vh] max-w-5xl bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
                
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                {/* Header - Fixed at top */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10 bg-black/20 shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">Knowledge Checkpoint</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-400 font-mono overflow-hidden">
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 shrink-0">WEEK {weekId}</span>
                                <span className="truncate">{topic}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all hover:rotate-90 shrink-0"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-white">Synthesizing Quiz...</h3>
                                <p className="text-gray-400 font-mono text-sm">AI is analyzing curriculum vectors</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center gap-8 max-w-lg mx-auto text-center px-4">
                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 ${isApiKeyMissing ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                {isApiKeyMissing ? <ShieldAlert className="w-12 h-12 text-yellow-400" /> : <AlertTriangle className="w-12 h-12 text-red-400" />}
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{isApiKeyMissing ? "Missing Credentials" : "Generation Failed"}</h3>
                                <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                                    {isApiKeyMissing 
                                        ? "The AI Mentor requires a valid API Key to generate real-time assessments. Please configure your environment to unlock this feature."
                                        : error}
                                </p>
                            </div>
                            
                            {isApiKeyMissing ? (
                                <div className="w-full bg-black/30 rounded-xl p-4 border border-white/10 text-left">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">How to fix:</p>
                                    <code className="block bg-black/50 p-3 rounded-lg text-sm text-green-400 font-mono border border-white/5 overflow-x-auto">
                                        // Create .env file<br/>
                                        API_KEY=your_gemini_api_key
                                    </code>
                                    <a 
                                        href="https://aistudio.google.com/app/apikey" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="mt-4 block w-full py-3 bg-white text-black text-center font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Get API Key
                                    </a>
                                </div>
                            ) : (
                                <button 
                                    onClick={loadQuiz}
                                    className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg hover:scale-105 transform duration-200"
                                >
                                    <RefreshCw className="w-5 h-5" /> Retry Generation
                                </button>
                            )}
                        </div>
                    ) : showResults ? (
                        <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
                            <div className="relative mb-10 group">
                                <div className={`absolute inset-0 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity ${score / questions.length >= 0.8 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-4 relative z-10 bg-gray-900 ${
                                    score / questions.length >= 0.8 ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'
                                }`}>
                                    {score / questions.length >= 0.8 ? <Trophy className="w-16 h-16 md:w-20 md:h-20" /> : <RefreshCw className="w-16 h-16 md:w-20 md:h-20" />}
                                </div>
                            </div>
                            
                            <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">{Math.round((score / questions.length) * 100)}%</h2>
                            <p className="text-xl md:text-2xl text-gray-400 mb-10 font-medium text-center">
                                {score / questions.length >= 0.8 ? "Proficiency Verified." : "Proficiency Not Met."}
                            </p>

                            <div className="grid grid-cols-2 gap-6 mb-10 w-full max-w-md">
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{score}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Correct</div>
                                </div>
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{questions.length - score}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Incorrect</div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={score / questions.length >= 0.8 ? onClose : loadQuiz}
                                className={`px-10 py-4 text-lg font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl ${
                                    score / questions.length >= 0.8 
                                    ? 'bg-green-500 hover:bg-green-400 text-black shadow-green-900/20' 
                                    : 'bg-white hover:bg-gray-200 text-black shadow-white/10'
                                }`}
                            >
                                {score / questions.length >= 0.8 ? "Return to Dashboard" : "Retake Assessment"}
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-start">
                            {/* Progress Header */}
                            <div className="flex justify-between items-end mb-6 shrink-0">
                                <span className="text-xs md:text-sm font-mono text-gray-500 tracking-wider">QUESTION {currentQuestionIdx + 1} OF {questions.length}</span>
                                <span className="text-xs md:text-sm font-bold text-white">{Math.round(((currentQuestionIdx) / questions.length) * 100)}% Complete</span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-8 md:mb-10 shrink-0">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out" 
                                    style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                                ></div>
                            </div>

                            {/* Question Card - Allow flexibility */}
                            <div className="flex-1">
                                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight mb-8">
                                    {questions[currentQuestionIdx].question}
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    {questions[currentQuestionIdx].options.map((opt, i) => {
                                        let btnClass = "relative p-5 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ";
                                        
                                        if (selectedOption === null) {
                                            btnClass += "bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:-translate-y-1";
                                        } else if (i === questions[currentQuestionIdx].correctIndex) {
                                            btnClass += "bg-green-500/20 border-green-500/50 text-green-100 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                                        } else if (i === selectedOption) {
                                            btnClass += "bg-red-500/20 border-red-500/50 text-red-100";
                                        } else {
                                            btnClass += "bg-black/20 border-white/5 opacity-40 grayscale";
                                        }

                                        return (
                                            <button 
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                disabled={selectedOption !== null}
                                                className={btnClass}
                                            >
                                                <div className="flex items-center justify-between relative z-10">
                                                    <span className="font-medium text-base">{opt}</span>
                                                    {selectedOption !== null && i === questions[currentQuestionIdx].correctIndex && (
                                                        <CheckCircle className="w-6 h-6 text-green-400 shrink-0 ml-2" />
                                                    )}
                                                    {selectedOption === i && i !== questions[currentQuestionIdx].correctIndex && (
                                                        <XCircle className="w-6 h-6 text-red-400 shrink-0 ml-2" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Feedback & Navigation Footer */}
                            {selectedOption !== null && (
                                <div className="mt-8 shrink-0 animate-in slide-in-from-bottom-4 fade-in duration-300 pb-2">
                                    <div className="bg-gray-800/80 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl ring-1 ring-white/5">
                                        <div className="flex-1">
                                            <h5 className={`text-xs font-bold uppercase mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                {isCorrect ? 'Correct Analysis' : 'Incorrect Analysis'}
                                            </h5>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                {questions[currentQuestionIdx].explanation}
                                            </p>
                                        </div>
                                        
                                        <button 
                                            onClick={nextQuestion}
                                            className="shrink-0 w-full md:w-auto px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg hover:scale-105 transform duration-200"
                                        >
                                            {currentQuestionIdx === questions.length - 1 ? "Complete Assessment" : "Next Challenge"} 
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
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
                title="Checkpoint Cleared 🛡️"
                message="You have demonstrated theoretical competence. Proceed to practical application."
            />
        </div>
    );
};

export default QuizModal;
