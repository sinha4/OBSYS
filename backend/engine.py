from backend.models import Process
from backend.schedulers import (
    fcfs_scheduling,
    round_robin,
    sjf_non_preemptive
)

def run_scheduler(algo, process_data, quantum=None):

    processes = [
        Process(pid, arrival, burst)
        for pid, arrival, burst in process_data
    ]

    if algo == "fcfs":
        gantt, result = fcfs_scheduling(processes)
        history = None

    elif algo == "rr":
        if quantum is None:
            raise ValueError("Round Robin requires a quantum")
        gantt, history, result = round_robin(processes, quantum)

    elif algo == "sjf":
        gantt, result = sjf_non_preemptive(processes)
        history = None

    else:
        raise ValueError("Unsupported scheduling algorithm")

    metrics = compute_metrics(result)

    return {
        "gantt": gantt,
        "history": history,
        "metrics": metrics
    }


def compute_metrics(processes):
    n = len(processes)
    total_waiting = sum(p.waiting_time for p in processes)
    total_turnaround = sum(p.turnaround_time for p in processes)

    return {
        "average_waiting_time": total_waiting / n,
        "average_turnaround_time": total_turnaround / n,
        "processes": [
            {
                "pid": p.pid,
                "waiting_time": p.waiting_time,
                "turnaround_time": p.turnaround_time,
                "finish_time": p.finish_time
            }
            for p in processes
        ]
    }
