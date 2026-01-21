import argparse
from backend.command_mapper import command_to_process
from backend.system_state import add_process, get_processes, SYSTEM_TIME
from backend.engine import run_scheduler

def main():
    parser = argparse.ArgumentParser(prog="obsys")
    subparsers = parser.add_subparsers(dest="command")

    # obsys run <command>
    run_parser = subparsers.add_parser("run")
    run_parser.add_argument("program")

    # obsys schedule <algo>
    sched_parser = subparsers.add_parser("schedule")
    sched_parser.add_argument("algo", choices=["fcfs", "rr", "sjf"])
    sched_parser.add_argument("--quantum", type=int)

    args = parser.parse_args()

    if args.command == "run":
        proc = command_to_process(args.program, SYSTEM_TIME)
        add_process(proc)
        print(f"[OBSYS] Started process {proc}")

    elif args.command == "schedule":
        process_data = [
            (p["pid"], p["arrival"], p["burst"])
            for p in get_processes()
        ]

        result = run_scheduler(
            algo=args.algo,
            process_data=process_data,
            quantum=args.quantum
        )

        print("\nGANTT CHART:")
        for g in result["gantt"]:
            print(g)

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
