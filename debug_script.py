from backend.state_store import load_state
from backend.engine import run_scheduler
from backend.system_state import SystemState

try:
    print("Loading state...")
    state = load_state()
    print(f"State loaded: {state}")
    
    if state is None:
        print("State is None (Correctly handled in new api.py)")
        # Simulate what api.py does now
        print("Simulating API check...")
    else:
        print(f"State processes: {state.processes}")
        if not state.processes:
             print("No processes.")
        else:
             print("Running scheduler...")
             # This matches the NEW code in api.py
             try:
                 result = run_scheduler(algo="fcfs", processes=state.processes)
                 print("Scheduler result:", result)
             except Exception as e:
                 print(f"Scheduler failed with: {e}")
                 import traceback
                 traceback.print_exc()

except Exception as e:
    print(f"Top level error: {e}")
    import traceback
    traceback.print_exc()
