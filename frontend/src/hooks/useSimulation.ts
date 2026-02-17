import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { SchedulerResult, SimulationStatus, ProcessStateInfo, ProcessState } from '../types/simulation';

interface UseSimulationReturn {
    // State
    backendData: SchedulerResult | null;
    status: SimulationStatus;
    currentTime: number;
    speed: number;
    maxTime: number;

    // Derived state
    processStates: Map<string, ProcessStateInfo>;
    currentRunningProcess: string | null;
    readyQueue: string[];
    completedProcesses: string[];
    currentDecision: string;

    // Actions
    initialize: (data: SchedulerResult) => void;
    play: () => void;
    pause: () => void;
    step: () => void;
    reset: () => void;
    setSpeed: (speed: number) => void;
    seekTo: (time: number) => void;
}

export function useSimulation(): UseSimulationReturn {
    const [backendData, setBackendData] = useState<SchedulerResult | null>(null);
    const [status, setStatus] = useState<SimulationStatus>('IDLE');
    const [currentTime, setCurrentTime] = useState(0);
    const [speed, setSpeedState] = useState(1);

    const animationFrameRef = useRef<number | undefined>();
    const lastUpdateRef = useRef<number>(0);

    // Calculate max time from backend data
    const maxTime = backendData?.system_time || 0;

    // Derive process states based on current time
    const getProcessStates = useCallback((): Map<string, ProcessStateInfo> => {
        const states = new Map<string, ProcessStateInfo>();

        if (!backendData) return states;

        backendData.processes.forEach((proc) => {
            let state: ProcessState;
            let progress = 0;

            // Check if process is currently running by looking at Gantt entries
            const ganttEntries = backendData.gantt.filter(g => g.pid === proc.pid);
            const isRunning = ganttEntries.some(entry =>
                currentTime >= entry.start && currentTime < entry.end
            );

            if (isRunning) {
                state = 'RUNNING';
                // Calculate progress based on total execution time vs burst time
                const totalExecutedTime = ganttEntries.reduce((sum, entry) => {
                    const entryEnd = Math.min(entry.end, currentTime);
                    const entryStart = entry.start;
                    if (currentTime >= entryStart) {
                        return sum + (entryEnd - entryStart);
                    }
                    return sum;
                }, 0);
                progress = (totalExecutedTime / proc.burst_time) * 100;
            } else if (currentTime >= proc.finish_time) {
                state = 'COMPLETED';
                progress = 100;
            } else {
                state = 'READY';
                progress = 0;
            }

            states.set(proc.pid, {
                pid: proc.pid,
                state,
                progress,
                data: proc,
            });
        });

        return states;
    }, [backendData, currentTime]);

    const processStates = getProcessStates();

    // Derive current running process (memoized)
    const currentRunningProcess = useMemo(() =>
        Array.from(processStates.values())
            .find((p) => p.state === 'RUNNING')?.pid || null,
        [processStates]
    );

    // Derive ready queue (memoized)
    const readyQueue = useMemo(() =>
        Array.from(processStates.values())
            .filter((p) => p.state === 'READY')
            .sort((a, b) => a.data.arrival_time - b.data.arrival_time)
            .map((p) => p.pid),
        [processStates]
    );

    // Derive completed processes (memoized)
    const completedProcesses = useMemo(() =>
        Array.from(processStates.values())
            .filter((p) => p.state === 'COMPLETED')
            .sort((a, b) => a.data.finish_time - b.data.finish_time)
            .map((p) => p.pid),
        [processStates]
    );

    // Generate decision explanation
    const getCurrentDecision = useCallback((): string => {
        if (!backendData || !currentRunningProcess) {
            return 'Waiting for next process...';
        }

        const runningProc = processStates.get(currentRunningProcess);
        if (!runningProc) return '';

        const algo = backendData.algorithm.toUpperCase();
        const pid = runningProc.pid;
        const arrivalTime = runningProc.data.arrival_time;
        const burstTime = runningProc.data.burst_time;

        switch (algo) {
            case 'FCFS':
                return `Selected ${pid} - First Come First Serve (arrival: ${arrivalTime}ms)`;
            case 'SJF':
                return `Selected ${pid} - Shortest Job First (burst: ${burstTime}ms)`;
            case 'RR':
                return `Selected ${pid} - Round Robin (next in queue)`;
            case 'PRIORITY':
                return `Selected ${pid} - Highest priority process`;
            default:
                return `Executing ${pid}`;
        }
    }, [backendData, currentRunningProcess, processStates]);

    const currentDecision = getCurrentDecision();

    // Animation loop
    useEffect(() => {
        if (status !== 'RUNNING') {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            return;
        }

        const animate = (timestamp: number) => {
            if (!lastUpdateRef.current) {
                lastUpdateRef.current = timestamp;
            }

            const deltaTime = timestamp - lastUpdateRef.current;

            // Update every 250ms scaled by speed (optimized for performance)
            if (deltaTime >= 250 / speed) {
                setCurrentTime((prev) => {
                    const next = prev + 1;
                    if (next >= maxTime) {
                        setStatus('COMPLETED');
                        return maxTime;
                    }
                    return next;
                });
                lastUpdateRef.current = timestamp;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [status, speed, maxTime]);

    // Actions
    const initialize = useCallback((data: SchedulerResult) => {
        setBackendData(data);
        setCurrentTime(0);
        setStatus('PAUSED');
    }, []);

    const play = useCallback(() => {
        if (status === 'COMPLETED') {
            setCurrentTime(0);
        }
        setStatus('RUNNING');
        lastUpdateRef.current = 0;
    }, [status]);

    const pause = useCallback(() => {
        setStatus('PAUSED');
    }, []);

    const step = useCallback(() => {
        setCurrentTime((prev) => Math.min(prev + 1, maxTime));
        if (currentTime + 1 >= maxTime) {
            setStatus('COMPLETED');
        }
    }, [currentTime, maxTime]);

    const reset = useCallback(() => {
        setCurrentTime(0);
        setStatus('PAUSED');
    }, []);

    const setSpeed = useCallback((newSpeed: number) => {
        setSpeedState(newSpeed);
    }, []);

    const seekTo = useCallback((time: number) => {
        const clampedTime = Math.max(0, Math.min(time, maxTime));
        setCurrentTime(clampedTime);
        if (clampedTime >= maxTime) {
            setStatus('COMPLETED');
        } else if (status === 'COMPLETED') {
            setStatus('PAUSED');
        }
    }, [maxTime, status]);

    return {
        backendData,
        status,
        currentTime,
        speed,
        maxTime,
        processStates,
        currentRunningProcess,
        readyQueue,
        completedProcesses,
        currentDecision,
        initialize,
        play,
        pause,
        step,
        reset,
        setSpeed,
        seekTo,
    };
}
