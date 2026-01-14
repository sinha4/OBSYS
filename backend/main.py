class Process:
    def __init__(self, pid, arrival_time, burst_time, priority=0):
        self.pid = pid
        self.arrival_time = arrival_time
        self.burst_time = burst_time
        self.remaining_time = burst_time
        self.priority = priority

        self.start_time = None
        self.finish_time = None
        self.waiting_time = 0
        self.turnaround_time = 0

    def __repr__(self):
        return f"P{self.pid}(AT={self.arrival_time}, BT={self.burst_time}, PR={self.priority})"

def fcfs_scheduling(process_list):
    process_list.sort(key=lambda p: p.arrival_time)

    current_time = 0
    gantt_chart = []

    for p in process_list:
        if current_time < p.arrival_time:
            current_time = p.arrival_time

        p.start_time = current_time
        current_time += p.burst_time
        p.finish_time = current_time

        p.turnaround_time = p.finish_time - p.arrival_time
        p.waiting_time = p.turnaround_time - p.burst_time

        gantt_chart.append((p.pid, p.start_time, p.finish_time))

    return gantt_chart, process_list

from collections import deque

def round_robin(process_list, quantum):
    time = 0
    queue = []
    gantt_chart = []
    history = []   # <-- NEW

    # deep copy burst time to remaining time
    for p in process_list:
        p.remaining_time = p.burst_time
        p.finish_time = None

    # Sort by arrival time
    process_list.sort(key=lambda p: p.arrival_time)

    i = 0  # index over arrival list
    n = len(process_list)

    while i < n or queue:

        # add arrived processes
        while i < n and process_list[i].arrival_time <= time:
            queue.append(process_list[i])
            i += 1

        # CPU idle
        if not queue:
            history.append({
                "time": time,
                "running": None,
                "ready_queue": []
            })
            time += 1
            continue

        current = queue.pop(0)

        # log state BEFORE execution
        history.append({
            "time": time,
            "running": current.pid,
            "ready_queue": [p.pid for p in queue]
        })

        exec_time = min(quantum, current.remaining_time)

        start = time
        time += exec_time
        end = time

        gantt_chart.append((current.pid, start, end))

        current.remaining_time -= exec_time

        # add newly arrived processes during slice
        while i < n and process_list[i].arrival_time <= time:
            queue.append(process_list[i])
            i += 1

        # if unfinished, push back to queue
        if current.remaining_time > 0:
            queue.append(current)
        else:
            current.finish_time = time
            current.turnaround_time = current.finish_time - current.arrival_time
            current.waiting_time = current.turnaround_time - current.burst_time

    return gantt_chart, history, process_list


def sjf_non_preemptive(process_list):
    time = 0
    completed = 0
    n = len(process_list)

    gantt_chart = []

    # Reset fields in case reused
    for p in process_list:
        p.remaining_time = p.burst_time
        p.start_time = None
        p.finish_time = None

    while completed < n:

        # pick process with minimum burst among arrived & not completed
        available = [p for p in process_list if p.arrival_time <= time and p.finish_time is None]

        if not available:
            # CPU idle
            time += 1
            continue

        # choose smallest burst time
        current = min(available, key=lambda p: p.burst_time)

        # mark start time
        current.start_time = time

        start = time
        time += current.burst_time
        end = time

        # update metrics
        current.finish_time = time
        current.turnaround_time = current.finish_time - current.arrival_time
        current.waiting_time = current.turnaround_time - current.burst_time

        gantt_chart.append((current.pid, start, end))

        completed += 1

    return gantt_chart, process_list


if __name__ == "__main__":
    processes = [
        Process(1, 0, 5),
        Process(2, 1, 4),
        Process(3, 2, 2),
    ]

    gantt, history, result = round_robin(processes, quantum=2)

    print("Gantt:", gantt)
    print("\nHistory:")
    for h in history:
        print(h)


