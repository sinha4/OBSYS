import { motion, AnimatePresence } from 'framer-motion';
import type { ProcessStateInfo } from '../types/simulation';

interface ProcessVisualizerProps {
    processStates: Map<string, ProcessStateInfo>;
    readyQueue: string[];
    currentRunningProcess: string | null;
    completedProcesses: string[];
}

const PROCESS_COLORS: Record<string, string> = {
    '1': 'bg-yellow-500',
    '2': 'bg-emerald-500',
    '3': 'bg-cyan-500',
    '4': 'bg-pink-500',
    '5': 'bg-purple-500',
    '6': 'bg-orange-500',
};

function getProcessColor(pid: string): string {
    return PROCESS_COLORS[pid] || 'bg-blue-500';
}

export default function ProcessVisualizer({
    processStates,
    readyQueue,
    currentRunningProcess,
    completedProcesses,
}: ProcessVisualizerProps) {
    const runningProcess = currentRunningProcess ? processStates.get(currentRunningProcess) : null;

    return (
        <div className="grid grid-cols-3 gap-6">
            {/* Ready Queue */}
            <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(234,179,8,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                    <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Ready Queue</h3>
                    <span className="text-gray-500 text-xs font-mono">[{readyQueue.length}]</span>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {readyQueue.map((pid) => {
                            const proc = processStates.get(pid);
                            if (!proc) return null;

                            return (
                                <motion.div
                                    key={pid}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-yellow-500/10 border border-yellow-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-yellow-400 font-bold text-xl leading-none">P{pid}</span>
                                            <span className="text-[10px] text-yellow-500/70 font-mono uppercase mt-1">{proc.data.program}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">PRIO: {(proc.data as any).priority || 1}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono">
                                        BURST: <span className="text-yellow-400">{proc.data.burst_time}ms</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {readyQueue.length === 0 && (
                        <div className="text-gray-600 text-sm font-mono text-center py-8">
                            Queue empty
                        </div>
                    )}
                </div>
            </div>

            {/* CPU Core */}
            <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${runningProcess ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gray-600'}`}></div>
                    <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider">CPU Core</h3>
                </div>

                <div className="relative h-64 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {runningProcess ? (
                            <motion.div
                                key={runningProcess.pid}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="w-full"
                            >
                                <div className="bg-emerald-500/20 border-2 border-emerald-500/60 rounded-xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] relative overflow-hidden">
                                    {/* Animated background pulse */}
                                    <motion.div
                                        className="absolute inset-0 bg-emerald-500/10"
                                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />

                                    <div className="relative z-10">
                                        <div className="text-center mb-4">
                                            <div className="text-emerald-400 font-bold text-4xl mb-1">P{runningProcess.pid}</div>
                                            <div className="text-sm text-emerald-500/80 font-mono font-bold uppercase mb-2">{runningProcess.data.program}</div>
                                            <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase opacity-60">EXECUTING</div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="bg-gray-800/60 rounded-full h-3 overflow-hidden mb-3">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${runningProcess.progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>

                                        <div className="text-xs text-gray-400 font-mono text-center">
                                            {Math.round(runningProcess.progress)}% complete
                                        </div>

                                        <div className="mt-4 text-xs text-gray-500 font-mono">
                                            Remaining: {Math.max(0, runningProcess.data.finish_time - (runningProcess.data.start_time + (runningProcess.data.burst_time * runningProcess.progress / 100)))}ms
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-gray-600 text-center"
                            >
                                <div className="text-6xl mb-4">⏸</div>
                                <div className="text-sm font-mono uppercase">IDLE</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Completed */}
            <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(168,85,247,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                    <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wider">Completed</h3>
                    <span className="text-gray-500 text-xs font-mono">[{completedProcesses.length}]</span>
                </div>

                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                        {completedProcesses.map((pid) => {
                            const proc = processStates.get(pid);
                            if (!proc) return null;

                            return (
                                <motion.div
                                    key={pid}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-purple-500/10 border border-purple-500/40 rounded-lg px-3 py-2 flex items-center gap-3"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-purple-400 font-bold text-sm">P{pid}</span>
                                        <span className="text-[9px] text-purple-500/60 font-mono uppercase">{proc.data.program}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-500 font-mono">TAT: {proc.data.turnaround_time}ms</span>
                                    </div>
                                    <span className="text-xs text-emerald-400 font-mono">✓</span>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {completedProcesses.length === 0 && (
                        <div className="text-gray-600 text-sm font-mono text-center py-8 w-full">
                            No completed processes
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
