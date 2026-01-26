
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatWithMentor, generateMotivation } from '../services/geminiService';
import { ChatMessage, UserStats } from '../types';
import { Send, Bot, Sparkles, X, MessageSquare } from 'lucide-react';

interface AiMentorProps {
    userStats: UserStats | null; // Allow null to handle initial load safely
}

const AiMentor: React.FC<AiMentorProps> = ({ userStats }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: "Hello! I'm your DevOps Mentor. I can help you with AWS, Kubernetes, and your learning path. Ask me anything!", timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const context = userStats 
            ? `User is Level ${userStats.level} DevOps student. Streak: ${userStats.streak}.` 
            : 'User is a DevOps student.';
            
        const responseText = await chatWithMentor(input, context);

        const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
    };

    const handleGetMotivation = async () => {
        if (!userStats) return;
        setIsLoading(true);
        const motivation = await generateMotivation(userStats.streak, userStats.xp);
        const botMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: motivation, timestamp: Date.now() };
        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-surface-cardDark border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl w-[90vw] sm:w-[350px] md:w-[400px] h-[60vh] sm:h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right mb-2">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-black/40 backdrop-blur-sm flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">DevOps Mentor</h3>
                                <p className="text-[10px] text-emerald-600 dark:text-green-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             {userStats && (
                                <button 
                                    onClick={handleGetMotivation}
                                    title="Get Hype"
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-yellow-500 dark:text-yellow-400 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </button>
                             )}
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-black/20">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-sm' 
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-gray-100 rounded-bl-sm border border-slate-200 dark:border-white/5'
                                }`}>
                                    <ReactMarkdown 
                                        components={{
                                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                            strong: ({node, ...props}) => <span className={`font-bold ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-900 dark:text-yellow-300'}`} {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                                            li: ({node, ...props}) => <li className="ml-1" {...props} />,
                                            code: ({node, ...props}) => <code className={`rounded px-1 py-0.5 font-mono text-xs border ${msg.role === 'user' ? 'bg-blue-700 text-blue-100 border-blue-500' : 'bg-white dark:bg-black/30 text-emerald-600 dark:text-green-300 border-slate-200 dark:border-white/10'}`} {...props} />,
                                            pre: ({node, ...props}) => <pre className="bg-slate-900 dark:bg-black/50 p-2 rounded-lg my-2 overflow-x-auto border border-slate-700 dark:border-gray-600 text-white" {...props} />,
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-white/10 rounded-2xl rounded-bl-sm p-3 border border-slate-200 dark:border-white/5 shadow-sm">
                                    <div className="flex gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-surface-cardDark border-t border-slate-200 dark:border-white/10">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about Cloud & DevOps..."
                                className="flex-1 bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-brand-500/40 text-white transition-all duration-500 hover:scale-110 active:scale-95 ${
                    isOpen ? 'rotate-90 bg-slate-700 dark:bg-gray-700' : 'animate-[pulse_3s_ease-in-out_infinite] bg-gradient-to-tr from-brand-600 via-gold-500 to-brand-600 bg-[length:200%_200%] animate-gradient-xy'
                }`}
                style={{
                    backgroundSize: '200% 200%',
                    animation: isOpen ? 'none' : 'gradient 3s ease infinite',
                }}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageSquare className="w-6 h-6 absolute transition-all duration-300 group-hover:opacity-0 group-hover:scale-50" />
                        <Bot className="w-7 h-7 absolute opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
                        
                        {/* Notification Dot */}
                        <span className="absolute top-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </>
                )}
            </button>
            
            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default AiMentor;
