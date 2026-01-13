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
    # Sort by arrival time first
    process_list.sort(key=lambda p: p.arrival_time)

    time = 0
    gantt_chart = []
    ready_queue = deque()
    i = 0  # index to iterate through sorted processes

    while i < len(process_list) or ready_queue:

        # Add newly arrived processes to queue
        while i < len(process_list) and process_list[i].arrival_time <= time:
            ready_queue.append(process_list[i])
            i += 1

        # If no process is ready → CPU idle
        if not ready_queue:
            time += 1
            continue

        current = ready_queue.popleft()

        # First time the process gets CPU
        if current.start_time is None:
            current.start_time = time

        # Execute for min(quantum, remaining)
        exec_time = min(quantum, current.remaining_time)
        start = time
        time += exec_time
        end = time

        # Record Gantt slice
        gantt_chart.append((current.pid, start, end))

        current.remaining_time -= exec_time

        # Add processes that arrived during execution
        while i < len(process_list) and process_list[i].arrival_time <= time:
            ready_queue.append(process_list[i])
            i += 1

        # If process still has work → enqueue again
        if current.remaining_time > 0:
            ready_queue.append(current)
        else:
            # Finished
            current.finish_time = time
            current.turnaround_time = current.finish_time - current.arrival_time
            current.waiting_time = current.turnaround_time - current.burst_time

    return gantt_chart, process_list


if __name__ == "__main__":
    processes = [
        Process(1, 0, 4),
        Process(2, 1, 3),
        Process(3, 2, 1)
    ]

    gantt, result = round_robin(processes, quantum=2)

    print("Gantt Chart:", gantt)

    for p in result:
        print(f"P{p.pid}: WT={p.waiting_time}, TAT={p.turnaround_time}")
