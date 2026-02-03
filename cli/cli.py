import argparse
import webbrowser
import subprocess
import time
import sys


from backend.command_mapper import command_to_process
from backend.state_store import load_state, save_state
from backend.system_state import SystemState
from backend.engine import run_scheduler


def main():
    parser = argparse.ArgumentParser(prog="obsys")
    subparsers = parser.add_subparsers(dest="command")

    # obsys run <program>
    run_parser = subparsers.add_parser("run")
    run_parser.add_argument("program")

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

    # ---------------- SCHEDULE COMMAND ----------------
    elif args.command == "schedule":
        print("[OBSYS] Scheduling processes...")


        subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "backend.api:app",
                "--port",
                "8000",
                "--reload"
            ]
        )


        time.sleep(1)

        url = f"http://127.0.0.1:8000/schedule/{args.algo}"
        if args.algo == "rr" and args.quantum:
            url += f"?quantum={args.quantum}"

        print(f"[OBSYS] Opening browser → {url}")
        webbrowser.open(url)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()