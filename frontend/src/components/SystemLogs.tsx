import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface LogEntry {
    id: number;
    level: 'INIT' | 'INFO' | 'WAIT' | 'SYS' | 'CPU' | 'EXEC' | 'DONE' | 'ERROR';
    message: string;
    timestamp: number;
}

interface SystemLogsProps {
    status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
    currentRunningProcess: string | null;
    completedProcesses: string[];
    algorithm: string;
}

const LOG_COLORS = {
    INIT: 'text-cyan-400',
    INFO: 'text-gray-400',
    WAIT: 'text-yellow-400',
    SYS: 'text-emerald-400',
    CPU: 'text-blue-400',
    EXEC: 'text-purple-400',
    DONE: 'text-green-400',
    ERROR: 'text-red-400',
};

export default function SystemLogs({
    status,
    currentRunningProcess,
    completedProcesses,
    algorithm,
}: SystemLogsProps) {
    const [logs, setLogs] = useState<LogEntry[]>([
        { id: 1, level: 'INIT', message: 'System core initialized', timestamp: 0 },
        { id: 2, level: 'INFO', message: 'Scheduler ready...', timestamp: 0 },
    ]);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const logIdRef = useRef(3);
    const lastRunningRef = useRef<string | null>(null);
    const lastCompletedRef = useRef<Set<string>>(new Set());

    // Add log entry
    const addLog = (level: LogEntry['level'], message: string) => {
        setLogs((prev) => [
            ...prev,
            { id: logIdRef.current++, level, message, timestamp: Date.now() },
        ]);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Log status changes
    useEffect(() => {
        if (status === 'RUNNING' && logs.length === 2) {
            addLog('WAIT', 'Awaiting simulation start');
            addLog('SYS', `Starting ${algorithm} scheduler`);
            addLog('CPU', 'Initializing cores...');
        }
    }, [status, algorithm]);

    // Log process execution
    useEffect(() => {
        if (currentRunningProcess && currentRunningProcess !== lastRunningRef.current) {
            addLog('EXEC', `Loading P${currentRunningProcess} into CPU`);
            lastRunningRef.current = currentRunningProcess;
        }
    }, [currentRunningProcess]);

    // Log process completion
    useEffect(() => {
        completedProcesses.forEach((pid) => {
            if (!lastCompletedRef.current.has(pid)) {
                addLog('DONE', `P${pid} completed execution`);
                lastCompletedRef.current.add(pid);
            }
        });
    }, [completedProcesses]);

    // Log simulation completion
    useEffect(() => {
        if (status === 'COMPLETED' && !logs.some((log) => log.message.includes('All processes completed'))) {
            addLog('SYS', 'All processes completed');
            addLog('INFO', 'Simulation finished');
        }
    }, [status]);

    return (
        <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider">Sys_Logs</h3>
                <div className="flex-1"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            </div>

            <div
                ref={logContainerRef}
                className="bg-gray-900/60 border border-emerald-500/20 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar"
            >
                <AnimatePresence initial={false}>
                    {logs.map((log, index) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-1"
                        >
                            <span className="text-gray-600 mr-2">{String(index + 1).padStart(2, '0')}</span>
                            <span className={`font-bold mr-2 ${LOG_COLORS[log.level]}`}>[{log.level}]</span>
                            <span className="text-gray-300">{log.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
        </div>
    );
}
