// Type definitions for scheduler backend response
export interface SchedulerResult {
    algorithm: string;
    system_time: number;
    processes: ProcessData[];
    avg_turnaround_time: number;
    avg_waiting_time: number;
    cpu_utilization: number;
    gantt: GanttEntry[];
    history?: any;
}

export interface ProcessData {
    pid: string;
    arrival_time: number;
    burst_time: number;
    start_time: number;
    finish_time: number;
    turnaround_time: number;
    waiting_time: number;
}

export interface GanttEntry {
    pid: string;
    start: number;
    end: number;
}

// Simulation types
export type SimulationStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
export type ProcessState = 'READY' | 'RUNNING' | 'COMPLETED';

export interface ProcessStateInfo {
    pid: string;
    state: ProcessState;
    progress: number; // 0-100 for running processes
    data: ProcessData;
}

export interface SimulationState {
    backendData: SchedulerResult | null;
    status: SimulationStatus;
    currentTime: number;
    speed: number;
    processStates: Map<string, ProcessStateInfo>;
    currentRunningProcess: string | null;
    readyQueue: string[];
    completedProcesses: string[];
    currentDecision: string;
}
