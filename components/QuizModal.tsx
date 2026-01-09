
import React, { useState, useEffect } from 'react';
import { generateQuiz, QuizQuestion } from '../services/geminiService';
import { logActivity, saveQuizResult } from '../services/gamificationService';
import { ActivityType } from '../types';
import { Brain, CheckCircle, XCircle, Loader2, Trophy, ArrowRight, RefreshCw } from 'lucide-react';
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
        setQuestions([]);
        setScore(0);
        setCurrentQuestionIdx(0);
        setShowResults(false);
        const data = await generateQuiz(topic, weekId);
        setQuestions(data);
        setLoading(false);
    };

    const handleAnswer = (index: number) => {
        if (selectedOption !== null) return; // Prevent multiple clicks
        
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
        const finalScore = score + (isCorrect ? 1 : 0); // Add last point if just clicked
        // Actually, logic above updates state immediately? No, standard React batching. 
        // Let's rely on 'score' state but be careful.
        // Wait, handleAnswer updates score. nextQuestion is called by user. 
        // So score is up to date for previous questions. 
        
        const passed = (score / questions.length) >= 0.8;
        if (passed) {
            saveQuizResult(weekId, (score / questions.length) * 100);
            logActivity(ActivityType.QUIZ_COMPLETION, `Passed Quiz: ${topic}`, weekId);
            onComplete();
            setTimeout(() => setShowXPModal(true), 500);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-devops-card w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Knowledge Check</h3>
                            <p className="text-xs text-gray-500">Week {weekId}: {topic}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">Close</button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            <p className="text-gray-400 animate-pulse">Generating unique questions via Gemini...</p>
                        </div>
                    ) : showResults ? (
                        <div className="text-center py-8">
                            <div className="mb-6">
                                {score / questions.length >= 0.8 ? (
                                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                                        <Trophy className="w-12 h-12 text-green-400" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                                        <RefreshCw className="w-12 h-12 text-red-400" />
                                    </div>
                                )}
                                <h2 className="text-3xl font-bold text-white mb-2">{score} / {questions.length} Correct</h2>
                                <p className={`text-lg ${score / questions.length >= 0.8 ? 'text-green-400' : 'text-red-400'}`}>
                                    {score / questions.length >= 0.8 ? "Checkpoint Passed! XP Awarded." : "Study more and try again."}
                                </p>
                            </div>
                            
                            <button 
                                onClick={score / questions.length >= 0.8 ? onClose : loadQuiz}
                                className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                {score / questions.length >= 0.8 ? "Return to Curriculum" : "Retry Quiz"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Progress */}
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}></div>
                            </div>

                            {/* Question */}
                            <div>
                                <h4 className="text-xl font-bold text-white leading-relaxed mb-6">
                                    <span className="text-gray-500 mr-2">{currentQuestionIdx + 1}.</span>
                                    {questions[currentQuestionIdx].question}
                                </h4>
                                
                                <div className="space-y-3">
                                    {questions[currentQuestionIdx].options.map((opt, i) => {
                                        let btnClass = "w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group ";
                                        
                                        if (selectedOption === null) {
                                            btnClass += "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20";
                                        } else if (i === questions[currentQuestionIdx].correctIndex) {
                                            btnClass += "bg-green-500/20 border-green-500 text-green-300";
                                        } else if (i === selectedOption) {
                                            btnClass += "bg-red-500/20 border-red-500 text-red-300";
                                        } else {
                                            btnClass += "bg-white/5 border-white/5 opacity-50";
                                        }

                                        return (
                                            <button 
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                disabled={selectedOption !== null}
                                                className={btnClass}
                                            >
                                                <span className="font-medium">{opt}</span>
                                                {selectedOption !== null && i === questions[currentQuestionIdx].correctIndex && <CheckCircle className="w-5 h-5 text-green-400" />}
                                                {selectedOption === i && i !== questions[currentQuestionIdx].correctIndex && <XCircle className="w-5 h-5 text-red-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Explanation */}
                            {selectedOption !== null && (
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                    <h5 className="text-xs font-bold text-blue-400 uppercase mb-1">Explanation</h5>
                                    <p className="text-sm text-gray-300">{questions[currentQuestionIdx].explanation}</p>
                                    
                                    <div className="mt-4 flex justify-end">
                                        <button 
                                            onClick={nextQuestion}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            {currentQuestionIdx === questions.length - 1 ? "Finish" : "Next Question"} <ArrowRight className="w-4 h-4" />
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
                title="Knowledge Secured! 🧠"
                message="You've proven your understanding. Theory validated."
            />
        </div>
    );
};

export default QuizModal;
