import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface DecisionPanelProps {
    decision: string;
    algorithm: string;
}

export default function DecisionPanel({ decision, algorithm }: DecisionPanelProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [currentDecision, setCurrentDecision] = useState(decision);

    // Typewriter effect
    useEffect(() => {
        if (decision !== currentDecision) {
            setCurrentDecision(decision);
            setDisplayedText('');
        }

        if (displayedText.length < decision.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(decision.slice(0, displayedText.length + 1));
            }, 30);
            return () => clearTimeout(timeout);
        }
    }, [decision, displayedText, currentDecision]);

    return (
        <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Scheduler Decision</h3>
            </div>

            <div className="bg-gray-900/60 border border-cyan-500/20 rounded-lg p-4 min-h-[120px]">
                <div className="mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-mono">Algorithm:</span>
                    <span className="ml-2 text-cyan-400 font-bold font-mono">{algorithm}</span>
                </div>

                <div className="relative">
                    <div className="text-gray-300 font-mono text-sm leading-relaxed">
                        <span className="text-cyan-400 mr-2">&gt;</span>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={currentDecision}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {displayedText}
                                {displayedText.length < decision.length && (
                                    <motion.span
                                        className="inline-block w-2 h-4 bg-cyan-400 ml-1"
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                    />
                                )}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Educational Info */}
            <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <div className="text-xs text-gray-500 font-mono leading-relaxed">
                    {algorithm === 'FCFS' && (
                        <span>
                            <span className="text-cyan-400 font-bold">[INFO]</span> First Come First Serve selects processes in order of arrival time.
                        </span>
                    )}
                    {algorithm === 'SJF' && (
                        <span>
                            <span className="text-cyan-400 font-bold">[INFO]</span> Shortest Job First prioritizes processes with minimum burst time.
                        </span>
                    )}
                    {algorithm === 'RR' && (
                        <span>
                            <span className="text-cyan-400 font-bold">[INFO]</span> Round Robin allocates fixed time quantum to each process in circular order.
                        </span>
                    )}
                    {!['FCFS', 'SJF', 'RR'].includes(algorithm) && (
                        <span>
                            <span className="text-cyan-400 font-bold">[INFO]</span> Scheduler is making decisions based on the selected algorithm.
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
