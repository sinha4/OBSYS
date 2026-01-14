import argparse
from backend.main import Process, fcfs_scheduling, round_robin, sjf_non_preemptive

def parse_process_list(proc_strings):
    processes = []
    for s in proc_strings:
        pid, at, bt = map(int, s.split(","))
        processes.append(Process(pid, at, bt))
    return processes

def main():
    parser = argparse.ArgumentParser(description="CPU Scheduling Simulator")

    parser.add_argument(
        "--algo",
        choices=["fcfs", "rr", "sjf"],
        required=True,
        help="Scheduling algorithm to use",
    )

    parser.add_argument(
        "--processes",
        nargs="+",
        required=True,
        help="Processes as pid,arrival,burst e.g. 1,0,5 2,1,3 3,2,2",
    )

    parser.add_argument(
        "--quantum",
        type=int,
        default=2,
        help="Time quantum (only used for Round Robin)",
    )

    args = parser.parse_args()

    processes = parse_process_list(args.processes)

    if args.algo == "fcfs":
        gantt, result = fcfs_scheduling(processes)

    elif args.algo == "sjf":
        gantt, result = sjf_non_preemptive(processes)

    elif args.algo == "rr":
        gantt, history, result = round_robin(processes, args.quantum)

    print("\nGan tt Chart:")
    print(gantt)

    print("\n Process Table:")
    for p in result:
        print(
            f"P{p.pid}  AT={p.arrival_time}  BT={p.burst_time}  WT={p.waiting_time}  TAT={p.turnaround_time}"
        )

if __name__ == "__main__":
    main()
