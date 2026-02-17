from backend.schedulers import (
    fcfs_scheduling,
    round_robin,
    sjf_non_preemptive,
    priority_scheduling
)


def run_scheduler(algo, processes, quantum=None):
    """
    processes: List[Process]  (already created, from system state)
    """

    if not processes or len(processes) == 0:
        return {
            "error": "No processes to schedule"
        }

    processes = [p for p in processes]

    if algo == "fcfs":
        gantt, result = fcfs_scheduling(processes)
        history = None

    elif algo == "rr":
        # Default quantum to 2 if not provided
        if quantum is None:
            quantum = 2
        gantt, history, result = round_robin(processes, quantum)

    elif algo == "sjf":
        gantt, result = sjf_non_preemptive(processes)
        history = None

    elif algo == "priority":
        gantt, result = priority_scheduling(processes)
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

    if n == 0:
        return {
            "average_waiting_time": 0,
            "average_turnaround_time": 0,
            "processes": []
        }

    total_waiting = sum(p.waiting_time for p in processes)
    total_turnaround = sum(p.turnaround_time for p in processes)

    return {
        "average_waiting_time": total_waiting / n,
        "average_turnaround_time": total_turnaround / n,
        "processes": [
            {
                "pid": p.pid,
                "name": getattr(p, "name", ""),
                "waiting_time": p.waiting_time,
                "turnaround_time": p.turnaround_time,
                "finish_time": p.finish_time
            }
            for p in processes
        ]
    }
