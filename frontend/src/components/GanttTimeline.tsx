import { motion } from 'framer-motion';
import type { GanttEntry, ProcessData } from '../types/simulation';

interface GanttTimelineProps {
    gantt: GanttEntry[];
    processes: ProcessData[];
    currentTime: number;
    maxTime: number;
}

const PROCESS_COLORS: Record<string, string> = {
    '1': '#eab308', // yellow
    '2': '#10b981', // emerald
    '3': '#06b6d4', // cyan
    '4': '#ec4899', // pink
    '5': '#a855f7', // purple
    '6': '#f97316', // orange
    '7': '#8b5cf6', // violet
    '8': '#14b8a6', // teal
    '9': '#f59e0b', // amber
};

function getProcessColor(pid: string): string {
    return PROCESS_COLORS[pid] || '#3b82f6';
}

export default function GanttTimeline({ gantt, processes, currentTime, maxTime }: GanttTimelineProps) {
    // Group gantt entries by process
    const processRows = processes.map(proc => ({
        pid: proc.pid,
        entries: gantt.filter(g => g.pid === proc.pid)
    }));

    return (
        <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-teal-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(20,184,166,0.1)]">
            <div className="flex items-center gap-3 mb-6">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-teal-400 font-bold text-sm uppercase tracking-wider">Gantt_Chart</h3>
                <div className="flex-1"></div>
                <span className="text-gray-500 text-xs font-mono">Timeline: 0 - {maxTime}ms</span>
            </div>

            {/* Gantt Chart */}
            <div className="relative bg-gray-900/60 rounded-lg p-6">
                {/* Time axis */}
                <div className="flex justify-between mb-4 text-xs text-gray-400 font-mono px-16">
                    {[0, Math.floor(maxTime * 0.25), Math.floor(maxTime * 0.5), Math.floor(maxTime * 0.75), maxTime].map((time) => (
                        <div key={time} className="flex flex-col items-center">
                            <div className="w-px h-2 bg-gray-600 mb-1"></div>
                            <span>{time}ms</span>
                        </div>
                    ))}
                </div>

                {/* Process rows */}
                <div className="space-y-3">
                    {processRows.map((row) => (
                        <div key={row.pid} className="flex items-center gap-4">
                            {/* Process label */}
                            <div className="w-12 flex-shrink-0">
                                <div
                                    className="text-center font-bold text-sm px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: `${getProcessColor(row.pid)}20`,
                                        color: getProcessColor(row.pid),
                                        border: `1px solid ${getProcessColor(row.pid)}40`
                                    }}
                                >
                                    P{row.pid}
                                </div>
                            </div>

                            {/* Timeline bar */}
                            <div className="flex-1 relative h-12 bg-gray-800/80 rounded-lg border border-gray-700/50">
                                {/* Grid lines for better readability */}
                                <div className="absolute inset-0 flex">
                                    {[0.25, 0.5, 0.75].map((fraction) => (
                                        <div
                                            key={fraction}
                                            className="absolute top-0 bottom-0 w-px bg-gray-700/30"
                                            style={{ left: `${fraction * 100}%` }}
                                        />
                                    ))}
                                </div>

                                {/* Time cursor (only show on first row to avoid clutter) */}
                                {row.pid === processes[0].pid && (
                                    <motion.div
                                        className="absolute top-0 bottom-0 w-0.5 bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)] z-20"
                                        style={{
                                            left: `${(currentTime / maxTime) * 100}%`,
                                        }}
                                    >
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,1)]" />
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-teal-400 font-mono whitespace-nowrap">
                                            {currentTime}ms
                                        </div>
                                    </motion.div>
                                )}

                                {/* Process execution bars */}
                                {row.entries.map((entry, idx) => {
                                    const leftPercent = (entry.start / maxTime) * 100;
                                    const totalWidthPercent = ((entry.end - entry.start) / maxTime) * 100;

                                    // Calculate visible width based on current time
                                    const visibleEnd = Math.min(entry.end, currentTime);
                                    const isVisible = currentTime > entry.start;
                                    const visibleWidthPercent = isVisible
                                        ? ((visibleEnd - entry.start) / maxTime) * 100
                                        : 0;

                                    return (
                                        <div
                                            key={`${entry.pid}-${idx}`}
                                            className="absolute inset-y-1"
                                            style={{
                                                left: `${leftPercent}%`,
                                                width: `${totalWidthPercent}%`,
                                            }}
                                        >
                                            {/* Background outline (shows full duration) */}
                                            <div
                                                className="absolute inset-0 rounded border-2 border-dashed opacity-30"
                                                style={{
                                                    borderColor: getProcessColor(entry.pid)
                                                }}
                                            />

                                            {/* Animated colored bar (fills as time progresses) */}
                                            <motion.div
                                                className="absolute inset-0 rounded flex items-center justify-center text-white font-bold text-sm shadow-lg"
                                                style={{
                                                    backgroundColor: getProcessColor(entry.pid),
                                                    boxShadow: `0 0 15px ${getProcessColor(entry.pid)}80`,
                                                    width: `${(visibleWidthPercent / totalWidthPercent) * 100}%`,
                                                }}
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${(visibleWidthPercent / totalWidthPercent) * 100}%` }}
                                                transition={{ duration: 0.2, ease: 'linear' }}
                                            >
                                                {visibleWidthPercent > 8 && (
                                                    <div className="flex flex-col items-center">
                                                        <span className="drop-shadow-lg">P{entry.pid}</span>
                                                        <span className="text-[10px] opacity-80">{entry.start}-{entry.end}ms</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-teal-400 rounded"></div>
                            <span>= Currently Executing</span>
                        </div>
                        <div className="mx-2">|</div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 border-2 border-dashed border-gray-500 rounded"></div>
                            <span>= Scheduled (not yet started)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
