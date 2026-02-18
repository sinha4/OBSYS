import argparse
import webbrowser

from backend.command_mapper import command_to_process
from backend.state_store import load_state, save_state
from backend.system_state import SystemState


def main():
    parser = argparse.ArgumentParser(prog="obsys")
    subparsers = parser.add_subparsers(dest="command")

    # obsys run <program>
    run_parser = subparsers.add_parser("run")
    run_parser.add_argument("program")

    # obsys kill <pid> | --all
    kill_parser = subparsers.add_parser("kill")
    kill_parser.add_argument("pid", nargs="?", type=int, help="PID of the process to remove")
    kill_parser.add_argument("--all", action="store_true", help="Remove all processes")

    # obsys schedule <algo>
    sched_parser = subparsers.add_parser("schedule")
    sched_parser.add_argument("algo", choices=["fcfs", "rr", "sjf"])
    sched_parser.add_argument("--quantum", type=int)

    args = parser.parse_args()

    # LOAD OR INIT SYSTEM STATE
    state = load_state()
    if state is None:
        state = SystemState()

    # ---------------- RUN COMMAND ----------------
    if args.command == "run":
        proc = command_to_process(
            args.program,
            state.time,
            state.next_pid
        )

        state.processes.append(proc)
        state.next_pid += 1
        save_state(state)

        print(f"[OBSYS] Process added → PID={proc.pid}, Program={args.program}")

    # ---------------- KILL COMMAND ----------------
    elif args.command == "kill":
        if args.all:
            from backend.state_store import reset_state
            reset_state()
            print("[OBSYS] All processes cleared.")
        elif args.pid is not None:
            before = len(state.processes)
            state.processes = [p for p in state.processes if p.pid != args.pid]
            if len(state.processes) < before:
                save_state(state)
                print(f"[OBSYS] Process PID={args.pid} removed.")
            else:
                print(f"[OBSYS] No process found with PID={args.pid}")
        else:
            print("[OBSYS] Usage: obsys kill <pid>  OR  obsys kill --all")

    # ---------------- SCHEDULE COMMAND ----------------
    elif args.command == "schedule":
        print("[OBSYS] Scheduling processes...")

        url = f"http://127.0.0.1:8000/schedule/{args.algo}"
        if args.algo == "rr" and args.quantum:
            url += f"?quantum={args.quantum}"

        print(f"[OBSYS] Opening browser → {url}")
        webbrowser.open(url)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
