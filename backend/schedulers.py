from collections import deque

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


def round_robin(process_list, quantum):
    time = 0
    queue = []
    gantt_chart = []
    history = []

    for p in process_list:
        p.remaining_time = p.burst_time
        p.finish_time = None

    process_list.sort(key=lambda p: p.arrival_time)
    i = 0
    n = len(process_list)

    while i < n or queue:
        while i < n and process_list[i].arrival_time <= time:
            queue.append(process_list[i])
            i += 1

        if not queue:
            history.append({
                "time": time,
                "running": None,
                "ready_queue": []
            })
            time += 1
            continue

        current = queue.pop(0)

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

        while i < n and process_list[i].arrival_time <= time:
            queue.append(process_list[i])
            i += 1

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

    for p in process_list:
        p.remaining_time = p.burst_time
        p.start_time = None
        p.finish_time = None

    while completed < n:
        available = [p for p in process_list if p.arrival_time <= time and p.finish_time is None]

        if not available:
            time += 1
            continue

        current = min(available, key=lambda p: p.burst_time)
        current.start_time = time

        start = time
        time += current.burst_time
        end = time

        current.finish_time = time
        current.turnaround_time = current.finish_time - current.arrival_time
        current.waiting_time = current.turnaround_time - current.burst_time

        gantt_chart.append((current.pid, start, end))
        completed += 1

    return gantt_chart, process_list
