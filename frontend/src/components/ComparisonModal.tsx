import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import AlgoComparisonChart from './AlgoComparisonChart';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    results: any[];
}

export default function ComparisonModal({ isOpen, onClose, results }: Props) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050810]/95 backdrop-blur-2xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0f1d] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(20,184,166,0.15)] overflow-hidden flex flex-col"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] pointer-events-none" />

                        {/* Top Bar */}
                        <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 relative z-10 bg-[#0a0f1d]/50 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                                    <Sparkles className="w-6 h-6 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Performance Comparison</h2>
                                    <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-0.5">Global Process Analytics Dashboard</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all group"
                            >
                                <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 text-white">
                            <AlgoComparisonChart results={results} />
                        </div>

                        {/* Footer */}
                        <div className="px-10 py-6 border-t border-white/5 flex items-center justify-between bg-[#0a0f1d]/80 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                                <span className="text-xs text-gray-500 font-mono">Live engine analytics v1.0.4</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
