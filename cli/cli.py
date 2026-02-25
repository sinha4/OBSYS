import argparse
import webbrowser
import os
import socket
import subprocess
import sys
import time

# Setup Absolute Paths
CLI_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CLI_DIR)
sys.path.append(PROJECT_ROOT)

from backend.command_mapper import command_to_process
from backend.state_store import load_state, save_state
from backend.system_state import SystemState

VENV_PYTHON = os.path.join(PROJECT_ROOT, "venv", "bin", "python")
VENV_BIN = os.path.join(PROJECT_ROOT, "venv", "bin")

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("localhost", port)) == 0

def start_backend():
    if is_port_in_use(8000):
        print("[OBSYS] Backend is already running on port 8000.")
        return

    print("[OBSYS] Starting backend server...")
    subprocess.Popen(
        [VENV_PYTHON, "-m", "uvicorn", "backend.api:app", "--port", "8000"],
        cwd=PROJECT_ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
        start_new_session=True
    )
    # Wait for it to start
    for _ in range(10):
        if is_port_in_use(8000):
            print("[OBSYS] Backend started successfully.")
            return
        time.sleep(1)
    print("[OBSYS] Warning: Backend startup taking longer than expected.")

def start_frontend():
    if is_port_in_use(5173):
        print("[OBSYS] Frontend is already running on port 5173.")
        return

    print("[OBSYS] Starting frontend development server...")
    try:
        subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=os.path.join(PROJECT_ROOT, "frontend"),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            stdin=subprocess.DEVNULL,
            start_new_session=True
        )
    except FileNotFoundError:
        print("[OBSYS] Error: 'npm' command not found.")
        print("[OBSYS] Please ensure Node.js and npm are installed on your friend's laptop!")
        return
    # Wait for it to start
    for _ in range(15):
        if is_port_in_use(5173):
            print("[OBSYS] Frontend started successfully.")
            return
        time.sleep(1)
    print("[OBSYS] Warning: Frontend startup taking longer than expected.")

def main():
    parser = argparse.ArgumentParser(prog="obsys")
    subparsers = parser.add_subparsers(dest="command")

    # obsys run <program>
    run_parser = subparsers.add_parser("run")
    run_parser.add_argument("program")

    # obsys kill <pid> | --all | reset
    kill_parser = subparsers.add_parser("kill")
    kill_parser.add_argument("pid", nargs="?", type=int)
    kill_parser.add_argument("--all", action="store_true")

    subparsers.add_parser("reset", help="Completely clear all processes and reset system state")
    subparsers.add_parser("ps", help="List all processes currently in the system state")
    subparsers.add_parser("status", help="Show the current database status and simulation history")

    # obsys install-global
    subparsers.add_parser("install-global", help="Show instructions to install obsys globally")
    # obsys schedule <algo>
    sched_parser = subparsers.add_parser("schedule")
    sched_parser.add_argument("algo", choices=["fcfs", "rr", "sjf", "priority"], default="fcfs", nargs="?")
    sched_parser.add_argument("--quantum", type=int)

    args = parser.parse_args()

    # ---------------- INSTALL GLOBAL ----------------
    if args.command == "install-global":
        script_path = os.path.join(PROJECT_ROOT, "obsys")
        # Ensure script is executable
        os.chmod(script_path, 0o755)
        
        print("\n[OBSYS] --- GLOBAL INSTALLATION ---")
        print(f"To run 'obsys' from ANY directory, add this alias to your shell config (.zshrc or .bashrc):")
        print(f"\n    alias obsys='{script_path}'")
        print("\nThen restart your terminal or run: source ~/.zshrc")
        return

    # Special Reset Command
    if args.command == "reset":
        from backend.state_store import reset_state
        reset_state()
        print("[OBSYS] System state reset. All processes cleared.")
        return

    # LOAD OR INIT SYSTEM STATE
    state = load_state()
    if state is None:
        state = SystemState()

    # ---------------- PS COMMAND ----------------
    if args.command == "ps":
        if not state.processes:
            print("[OBSYS] No processes in system state.")
        else:
            print(f"\n[OBSYS] Current Processes ({len(state.processes)} total):")
            print(f"{'PID':<6} {'PROGRAM':<15} {'ARRIVAL':<10} {'BURST':<10} {'PRIORITY':<10}")
            print("-" * 55)
            for p in state.processes:
                print(f"{p.pid:<6} {getattr(p, 'program', 'unknown'):<15} {p.arrival_time:<10} {p.burst_time:<10} {getattr(p, 'priority', '-'):<10}")
        return

    # ---------------- RUN COMMAND ----------------
    if args.command == "run":
        try:
            proc = command_to_process(
                args.program,
                state.time,
                state.next_pid
            )
            state.processes.append(proc)
            state.next_pid += 1
            save_state(state)
            print(f"[OBSYS] Process added → PID={proc.pid}, Program={args.program}")
            print(f"[OBSYS] Total processes in persistent state: {len(state.processes)}")
            print(f"[OBSYS] NOTE: OBSYS keeps processes until you run 'obsys reset'.")
        except ValueError as e:
            print(f"[OBSYS] Error: {e}")

    # ---------------- STATUS COMMAND ----------------
    elif args.command == "status":
        print("\n" + "="*60)
        print("  OBSYS SYSTEM STATUS (SQLite Backend)")
        print("="*60)
        
        # 1. Current Processes
        if not state.processes:
            print("\n[ACTIVE PROCESSES] None")
        else:
            print(f"\n[ACTIVE PROCESSES] ({len(state.processes)} total)")
            print(f"{'PID':<6} {'PROGRAM':<15} {'ARRIVAL':<10} {'BURST':<10}")
            print("-" * 45)
            for p in state.processes:
                print(f"{p.pid:<6} {getattr(p, 'program', 'unknown'):<15} {p.arrival_time:<10} {p.burst_time:<10}")

        # 2. Simulation History
        try:
            import requests
            response = requests.get("http://localhost:8000/history", timeout=2)
            if response.status_code == 200:
                history = response.json()
                if not history:
                    print("\n[SIMULATION HISTORY] No runs recorded yet.")
                else:
                    print(f"\n[SIMULATION HISTORY] Last {min(5, len(history))} runs")
                    print(f"{'ID':<4} {'ALGO':<10} {'WAITING':<10} {'TURNAROUND':<12} {'CPU %':<8}")
                    print("-" * 50)
                    for h in history[:5]:
                        print(f"{h['id']:<4} {h['algorithm']:<10} {h['avg_waiting_time']:<10.1f} {h['avg_turnaround_time']:<12.1f} {h['cpu_utilization']:<8.1f}")
        except Exception:
            # Fallback to direct DB query if API is down
            try:
                from backend.database import SessionLocal
                from backend.db_models import SimulationRunDB
                session = SessionLocal()
                history = session.query(SimulationRunDB).order_by(SimulationRunDB.timestamp.desc()).limit(5).all()
                if history:
                    print(f"\n[SIMULATION HISTORY] Last {len(history)} runs")
                    print(f"{'ID':<4} {'ALGO':<10} {'WAITING':<10} {'TURNAROUND':<12} {'CPU %':<8}")
                    print("-" * 50)
                    for h in history:
                        print(f"{h.id:<4} {h.algorithm:<10} {h.avg_waiting_time:<10.1f} {h.avg_turnaround_time:<12.1f} {h.cpu_utilization:<8.1f}")
                session.close()
            except Exception as e:
                print(f"\n[SIMULATION HISTORY] Could not retrieve history: {e}")
        
        print("\n" + "="*60 + "\n")
        return

    # ---------------- SCHEDULE COMMAND ----------------
    elif args.command == "schedule":
        # 1. Start Servers
        start_backend()
        start_frontend()

        # 2. Open Dashboard with Query Params for Auto-Run
        dashboard_url = f"http://localhost:5173/?algo={args.algo}"
        if args.algo == "rr" and args.quantum:
            dashboard_url += f"&quantum={args.quantum}"

        print(f"[OBSYS] Opening simulation dashboard → {dashboard_url}")
        webbrowser.open(dashboard_url)

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
